import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Camera, X, ZoomIn, ZoomOut, Bell, Lock, Info, Mail, Loader2 } from "lucide-react";
import Cropper from "react-easy-crop";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { AppLayout } from "@/layouts";
import { InputWithoutIcon, ButtonWithLoader, InputCheck, Breadcrumb } from "@/components/ui";
import { changePasswordSchema, type ChangePasswordForm } from "@/schemas";
import { useAuthStore } from "@/store";
import api from "@/config/api";
import getCroppedImg from "@/helpers/cropImage";
import { formatDate } from "@/helpers/formatDate";

const TABS = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security",      label: "Security",      icon: Lock },
  { id: "account",       label: "Account",       icon: Info },
] as const;

type TabId = typeof TABS[number]["id"];

export default function Profile() {
  const { user, setUser, setAuth } = useAuthStore();
  const [tab, setTab] = useState<TabId>("profile");
  const [name, setName] = useState(user?.name || "");
  const [notifyDown, setNotifyDown] = useState(user?.notify_down ?? true);
  const [notifyUp,   setNotifyUp]   = useState(user?.notify_up   ?? true);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeSent, setEmailChangeSent] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  const profileMutation = useMutation({
    mutationFn: (data: { name: string; avatar?: string }) =>
      api.put("/auth/profile", data).then(r => r.data),
    onSuccess: (data) => { setUser(data); toast.success("Profile updated"); },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Update failed");
    },
  });

  const notifMutation = useMutation({
    mutationFn: (prefs: { notify_down: boolean; notify_up: boolean }) =>
      api.post("/auth/notification-prefs", prefs).then(r => r.data),
    onSuccess: (data) => { setUser(data); toast.success("Notification preferences saved"); },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to save preferences");
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (data: ChangePasswordForm) => {
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(res.data.message);
      reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to change password");
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail.trim()) { toast.error("Enter a new email address"); return; }
    setEmailChangeLoading(true);
    try {
      const res = await api.post("/auth/request-email-change", { newEmail: newEmail.trim() });
      toast.success(res.data.message);
      setEmailChangeSent(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to send confirmation");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropOpen,    setCropOpen]    = useState(false);
  const [rawImage,    setRawImage]    = useState<string | null>(null);
  const [crop,        setCrop]        = useState({ x: 0, y: 0 });
  const [zoom,        setZoom]        = useState(1);
  const [croppedArea, setCroppedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [saving,      setSaving]      = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const url = URL.createObjectURL(file);
    setRawImage(url);
    setCropOpen(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropSave = async () => {
    if (!rawImage || !croppedArea) return;
    setSaving(true);
    try {
      const base64 = await getCroppedImg(rawImage, croppedArea);
      await profileMutation.mutateAsync({ name, avatar: base64 });
      setCropOpen(false);
      setRawImage(null);
    } catch {
      toast.error("Crop or upload failed, please try again");
    } finally {
      setSaving(false);
    }
  };

  const closeCropModal = () => {
    if (saving) return;
    setCropOpen(false);
    setRawImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <Breadcrumb crumbs={[{ label: "Profile" }]} />
        <div className="text-center">
          <h1 className="text-xl font-bold font-outfit">Profile</h1>
          <p className="text-sm text-muted">Manage your account settings</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-foreground rounded-xl p-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
                  tab === t.id
                    ? "bg-background text-main shadow-sm"
                    : "text-muted hover:text-main"
                )}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab: Profile */}
        {tab === "profile" && (
          <div className="bg-background border border-line rounded-xl p-5 space-y-5">
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-line">
              <div className="relative">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-2 border-line" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-foreground center text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <label
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 center text-white cursor-pointer shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={13} />
                </label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
              </div>
              <div className="text-center">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted">@{user?.username}</p>
                {(user?.is_admin || user?.is_superadmin) && (
                  <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {user.is_superadmin ? "SUPERADMIN" : "ADMIN"}
                  </span>
                )}
              </div>
            </div>

            <InputWithoutIcon id="name" label="Full name" type="text" value={name} onChange={e => setName(e.target.value)} />

            <div className="space-y-0 text-sm">
              <div className="flex justify-between py-2.5 border-b border-line">
                <span className="text-muted">Email</span>
                <span className="font-medium text-main">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted">Username</span>
                <span className="font-medium text-main">@{user?.username}</span>
              </div>
            </div>

            {/* Change email section */}
            <div className="border-t border-line pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-muted" />
                <p className="text-sm font-medium">Change email address</p>
              </div>
              {emailChangeSent ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
                  A confirmation link was sent to <strong>{newEmail}</strong>. Click it to complete the change. Check your spam folder if needed.
                  <button onClick={() => { setEmailChangeSent(false); setNewEmail(""); }} className="block mt-2 text-xs underline text-muted hover:text-main">
                    Send to a different address
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="New email address"
                    className="flex-1 h-10 rounded-xl border border-line px-3 text-sm bg-background focus:border-main"
                    onKeyDown={e => { if (e.key === "Enter") handleRequestEmailChange(); }}
                  />
                  <button
                    onClick={handleRequestEmailChange}
                    disabled={emailChangeLoading || !newEmail.trim()}
                    className="btn h-10 px-4 rounded-xl bg-foreground text-sm font-medium text-muted hover:text-main disabled:opacity-50 shrink-0 gap-2"
                  >
                    {emailChangeLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                    {emailChangeLoading ? "Sending…" : "Send link"}
                  </button>
                </div>
              )}
              <p className="text-xs text-muted">A confirmation link will be sent to the new address. Your current email stays active until confirmed.</p>
            </div>

            <ButtonWithLoader
              onClick={() => profileMutation.mutate({ name })}
              loading={profileMutation.isPending}
              initialText="Save changes"
              loadingText="Saving..."
              className="w-full h-10 rounded-xl btn-primary text-sm"
            />
          </div>
        )}

        {/* Tab: Notifications */}
        {tab === "notifications" && (
          <div className="bg-background border border-line rounded-xl p-5 space-y-5">
            <div>
              <h2 className="font-semibold text-sm">Email notifications</h2>
              <p className="text-xs text-muted mt-0.5">Global defaults — apply to all monitors unless individually overridden</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <InputCheck checked={notifyDown} onChange={e => setNotifyDown(e.target.checked)} size={20} />
              <div>
                <p className="text-sm font-medium">Alert when site goes down</p>
                <p className="text-xs text-muted">Receive an email immediately when a monitor fails</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <InputCheck checked={notifyUp} onChange={e => setNotifyUp(e.target.checked)} size={20} />
              <div>
                <p className="text-sm font-medium">Alert when site recovers</p>
                <p className="text-xs text-muted">Receive an email when a monitor comes back online</p>
              </div>
            </label>
            <ButtonWithLoader
              onClick={() => notifMutation.mutate({ notify_down: notifyDown, notify_up: notifyUp })}
              loading={notifMutation.isPending}
              initialText="Save preferences"
              loadingText="Saving..."
              className="w-full h-10 rounded-xl btn-primary text-sm"
            />
          </div>
        )}

        {/* Tab: Security */}
        {tab === "security" && (
          <div className="bg-background border border-line rounded-xl p-5 space-y-4">
            <div>
              <h2 className="font-semibold text-sm">Change password</h2>
              <p className="text-xs text-muted mt-0.5">Use a strong, unique password</p>
            </div>
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-3">
              <InputWithoutIcon type="password" label="Current password" placeholder="••••••••" error={errors.currentPassword?.message} {...register("currentPassword")} />
              <InputWithoutIcon type="password" label="New password" placeholder="••••••••" error={errors.newPassword?.message} {...register("newPassword")} />
              <InputWithoutIcon type="password" label="Confirm new password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
              <ButtonWithLoader type="submit" loading={isSubmitting} initialText="Change password" loadingText="Changing..." className="w-full h-10 rounded-xl btn-primary text-sm" />
            </form>
          </div>
        )}

        {/* Tab: Account */}
        {tab === "account" && (
          <div className="bg-background border border-line rounded-xl p-5 text-sm space-y-0">
            <h2 className="font-semibold text-sm mb-3">Account info</h2>
            <div className="flex justify-between py-3 border-b border-line">
              <span className="text-muted">Monitor limit</span>
              <span className="font-semibold text-main">
                {(user?.is_admin || user?.is_superadmin) ? "Unlimited" : (user?.monitor_limit ?? 20)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-line">
              <span className="text-muted">Account verified</span>
              <span className={`font-semibold ${user?.is_verified ? "text-emerald-500" : "text-red-500"}`}>
                {user?.is_verified ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-line">
              <span className="text-muted">Role</span>
              <span className="font-semibold text-main">
                {user?.is_superadmin ? "Super Admin" : user?.is_admin ? "Admin" : "User"}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-muted">Member since</span>
              <span className="font-semibold text-main">
                {user?.created_at ? formatDate(user.created_at) : "—"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Crop modal */}
      <AnimatePresence>
        {cropOpen && rawImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={closeCropModal}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-background rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Crop profile picture</h3>
                <button onClick={closeCropModal} className="text-muted hover:text-main transition-colors"><X size={18} /></button>
              </div>
              <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ height: 260 }}>
                <Cropper
                  image={rawImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
                  onCropChange={setCrop} onZoomChange={setZoom}
                  onCropComplete={(_: unknown, pixels: { x: number; y: number; width: number; height: number }) => setCroppedArea(pixels)}
                />
              </div>
              <div className="flex items-center gap-3">
                <ZoomOut size={16} className="text-muted shrink-0" />
                <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1 accent-emerald-500" />
                <ZoomIn size={16} className="text-muted shrink-0" />
              </div>
              <div className="flex gap-2">
                <button onClick={closeCropModal} disabled={saving} className="flex-1 h-10 rounded-xl border border-line text-sm font-medium disabled:opacity-50">Cancel</button>
                <button onClick={handleCropSave} disabled={saving} className="flex-1 h-10 rounded-xl btn-primary text-sm disabled:opacity-50">
                  {saving ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving…
                    </div>
                  ) : "Save picture"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
