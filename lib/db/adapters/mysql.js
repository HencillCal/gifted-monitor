async function createMysqlAdapter(DATABASE_URL) {
  const mysql = require('mysql2/promise');
  const url = new URL(DATABASE_URL.replace('mysql://', 'http://'));
  const pool = await mysql.createPool({
    host:             url.hostname,
    port:             url.port || 3306,
    user:             url.username,
    password:         url.password,
    database:         url.pathname.replace('/', ''),
    waitForConnections: true,
    connectionLimit:  10
  });

  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    password_hash TEXT NOT NULL,
    is_verified TINYINT(1) DEFAULT 0,
    is_admin TINYINT(1) DEFAULT 0,
    is_superadmin TINYINT(1) DEFAULT 0,
    is_disabled TINYINT(1) DEFAULT 0,
    avatar LONGTEXT,
    notify_down TINYINT(1) DEFAULT 1,
    notify_up TINYINT(1) DEFAULT 1,
    monitor_limit INT DEFAULT 20,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin TINYINT(1) DEFAULT 0`).catch(() => {});
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superadmin TINYINT(1) DEFAULT 0`).catch(() => {});
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_disabled TINYINT(1) DEFAULT 0`).catch(() => {});
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar LONGTEXT`).catch(() => {});
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_down TINYINT(1) DEFAULT 1`).catch(() => {});
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_up TINYINT(1) DEFAULT 1`).catch(() => {});
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS monitor_limit INT DEFAULT 20`).catch(() => {});

  await pool.query(`CREATE TABLE IF NOT EXISTS otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS monitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    path TEXT,
    method VARCHAR(10) DEFAULT 'GET',
    body TEXT,
    interval_mins INT DEFAULT 3,
    is_active TINYINT(1) DEFAULT 1,
    last_status VARCHAR(10) DEFAULT 'unknown',
    last_response_time INT,
    last_checked DATETIME,
    uptime_pct DECIMAL(5,2) DEFAULT 100,
    incident_start DATETIME,
    last_reminder_at DATETIME,
    notify_down TINYINT(1) DEFAULT 1,
    notify_up TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await pool.query(`ALTER TABLE monitors ADD COLUMN IF NOT EXISTS path TEXT`).catch(() => {});
  await pool.query(`ALTER TABLE monitors ADD COLUMN IF NOT EXISTS notify_down TINYINT(1) DEFAULT 1`).catch(() => {});
  await pool.query(`ALTER TABLE monitors ADD COLUMN IF NOT EXISTS notify_up TINYINT(1) DEFAULT 1`).catch(() => {});

  await pool.query(`CREATE TABLE IF NOT EXISTS check_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monitor_id INT,
    status VARCHAR(10) NOT NULL,
    response_time INT,
    error_msg TEXT,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    whatsapp VARCHAR(30) DEFAULT '',
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const row  = r => (Array.isArray(r[0]) ? r[0][0] : (r[0] || null));
  const rows = r => r[0] || [];

  return {
    async getUserCount() {
      const [r] = await pool.query('SELECT COUNT(*) as c FROM users');
      return r[0].c;
    },

    async createUser({ username, name, email, whatsapp, passwordHash, isAdmin = false, isSuperAdmin = false }) {
      const [r] = await pool.query(
        'INSERT INTO users (username,name,email,whatsapp,password_hash,is_admin,is_superadmin) VALUES (?,?,?,?,?,?,?)',
        [username, name, email, whatsapp, passwordHash, isAdmin ? 1 : 0, isSuperAdmin ? 1 : 0]
      );
      return { id: r.insertId, username, name, email, whatsapp, is_verified: false, is_admin: isAdmin, is_superadmin: isSuperAdmin, is_disabled: false };
    },

    async getUserByEmail(email)       { return row(await pool.query('SELECT * FROM users WHERE email=?',    [email])); },
    async getUserByUsername(username) { return row(await pool.query('SELECT * FROM users WHERE username=?', [username])); },
    async getUserByWhatsapp(whatsapp) { return row(await pool.query('SELECT * FROM users WHERE whatsapp=?', [whatsapp])); },
    async getUserById(id)             { return row(await pool.query('SELECT * FROM users WHERE id=?',       [id])); },

    async updateUser(id, fields) {
      const keys = Object.keys(fields);
      const set  = keys.map(k => `${k}=?`).join(', ');
      await pool.query(`UPDATE users SET ${set} WHERE id=?`, [...Object.values(fields), id]);
      return row(await pool.query('SELECT * FROM users WHERE id=?', [id]));
    },

    async getAllUsers({ search = '', page = 1, limit = 10 } = {}) {
      const offset = (page - 1) * limit;
      const like = `%${search}%`;
      const [r] = await pool.query(
        `SELECT u.id, u.username, u.name, u.email, u.whatsapp, u.is_verified, u.is_admin, u.is_superadmin,
                u.is_disabled, u.avatar, u.created_at,
                COALESCE(u.monitor_limit, 20) AS monitor_limit,
                (SELECT COUNT(*) FROM monitors m WHERE m.user_id = u.id) AS monitor_count
         FROM users u
         WHERE u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ?
         ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        [like, like, like, limit, offset]
      );
      const [cnt] = await pool.query(
        'SELECT COUNT(*) as c FROM users WHERE name LIKE ? OR email LIKE ? OR username LIKE ?',
        [like, like, like]
      );
      return { users: r || [], total: cnt[0]?.c || 0 };
    },

    async getUserMonitorCount(userId) {
      const [[{ c }]] = await pool.query('SELECT COUNT(*) as c FROM monitors WHERE user_id=?', [userId]);
      return c;
    },

    async deleteUser(id) { await pool.query('DELETE FROM users WHERE id=?', [id]); },

    async createOtp(email, code, type, expiresAt) {
      await pool.query('UPDATE otp_codes SET used=1 WHERE email=? AND type=? AND used=0', [email, type]);
      const [r] = await pool.query(
        'INSERT INTO otp_codes (email,code,type,expires_at) VALUES (?,?,?,?)',
        [email, code, type, expiresAt]
      );
      return { id: r.insertId, email, code, type };
    },

    async getValidOtp(email, code, type) {
      return row(await pool.query(
        `SELECT * FROM otp_codes WHERE email=? AND code=? AND type=? AND used=0 AND expires_at>NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [email, code, type]
      ));
    },

    async markOtpUsed(id) { await pool.query('UPDATE otp_codes SET used=1 WHERE id=?', [id]); },

    async createMonitor(userId, { name, url, path, method, body, intervalMins, notifyDown = true, notifyUp = true }) {
      const [r] = await pool.query(
        'INSERT INTO monitors (user_id,name,url,path,method,body,interval_mins,notify_down,notify_up) VALUES (?,?,?,?,?,?,?,?,?)',
        [userId, name, url, path || null, method || 'GET', body || null, intervalMins || 3, notifyDown ? 1 : 0, notifyUp ? 1 : 0]
      );
      return { id: r.insertId, user_id: userId, name, url, path: path || null, method: method || 'GET', body, interval_mins: intervalMins || 3, is_active: true, last_status: 'unknown', notify_down: notifyDown, notify_up: notifyUp };
    },

    async getUserMonitors(userId) {
      return rows(await pool.query('SELECT * FROM monitors WHERE user_id=? ORDER BY created_at DESC', [userId]));
    },

    async getAllMonitors({ search = '', page = 1, limit = 20 } = {}) {
      const offset = (page - 1) * limit;
      const like = `%${search}%`;
      const [r] = await pool.query(
        `SELECT m.*, u.name as user_name, u.email as user_email, u.username as user_username
         FROM monitors m JOIN users u ON m.user_id=u.id
         WHERE m.name LIKE ? OR m.url LIKE ? OR u.name LIKE ? OR u.email LIKE ?
         ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,
        [like, like, like, like, limit, offset]
      );
      const [cnt] = await pool.query(
        `SELECT COUNT(*) as c FROM monitors m JOIN users u ON m.user_id=u.id
         WHERE m.name LIKE ? OR m.url LIKE ? OR u.name LIKE ? OR u.email LIKE ?`,
        [like, like, like, like]
      );
      return { monitors: r || [], total: cnt[0]?.c || 0 };
    },

    async getMonitor(id) {
      return row(await pool.query('SELECT * FROM monitors WHERE id=?', [id]));
    },

    async updateMonitor(id, fields) {
      const keys = Object.keys(fields);
      const set  = keys.map(k => `${k}=?`).join(', ');
      await pool.query(`UPDATE monitors SET ${set} WHERE id=?`, [...Object.values(fields), id]);
      return row(await pool.query('SELECT * FROM monitors WHERE id=?', [id]));
    },

    async deleteMonitor(id) { await pool.query('DELETE FROM monitors WHERE id=?', [id]); },

    async getAllActiveMonitors() {
      return rows(await pool.query(
        `SELECT m.*, u.name as user_name, u.whatsapp as user_whatsapp
         FROM monitors m JOIN users u ON m.user_id=u.id WHERE m.is_active=1`
      ));
    },

    async addCheckHistory(monitorId, status, responseTime, errorMsg) {
      await pool.query(
        'INSERT INTO check_history (monitor_id,status,response_time,error_msg) VALUES (?,?,?,?)',
        [monitorId, status, responseTime || null, errorMsg || null]
      );
      const [[{ c }]] = await pool.query('SELECT COUNT(*) as c FROM check_history WHERE monitor_id=?', [monitorId]);
      if (c > 60) {
        const [old] = await pool.query(
          'SELECT id FROM check_history WHERE monitor_id=? ORDER BY checked_at ASC LIMIT 10',
          [monitorId]
        );
        if (old.length) {
          await pool.query('DELETE FROM check_history WHERE id IN (?)', [old.map(r => r.id)]);
        }
      }
      const [[stats]] = await pool.query(
        `SELECT COUNT(*) as total, SUM(status='up') as up_count FROM check_history WHERE monitor_id=?`,
        [monitorId]
      );
      const uptime = stats.total > 0 ? Math.round((stats.up_count / stats.total) * 1000) / 10 : 100;
      await pool.query('UPDATE monitors SET uptime_pct=? WHERE id=?', [uptime, monitorId]);
    },

    async getMonitorHistory(monitorId, limit = 30) {
      const [r] = await pool.query(
        'SELECT * FROM check_history WHERE monitor_id=? ORDER BY checked_at DESC LIMIT ?',
        [monitorId, limit]
      );
      return (r || []).reverse();
    },

    async saveContactMessage({ name, email, whatsapp, subject, message }) {
      const [r] = await pool.query(
        'INSERT INTO contact_messages (name,email,whatsapp,subject,message) VALUES (?,?,?,?,?)',
        [name, email, whatsapp || '', subject, message]
      );
      return { id: r.insertId, name, email, whatsapp, subject, message, is_read: false };
    },

    async getContactMessages({ page = 1, limit = 10 } = {}) {
      const offset = (page - 1) * limit;
      const [r] = await pool.query(
        'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM contact_messages');
      const [[{ unread }]] = await pool.query('SELECT COUNT(*) as unread FROM contact_messages WHERE is_read=0');
      return { messages: r || [], total, unread };
    },

    async markContactRead(id) {
      await pool.query('UPDATE contact_messages SET is_read=1 WHERE id=?', [id]);
    },

    async deleteContactMessage(id) {
      await pool.query('DELETE FROM contact_messages WHERE id=?', [id]);
    }
  };
}

module.exports = { createMysqlAdapter };
