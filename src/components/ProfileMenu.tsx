import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Loader2,
  LogOut,
  Mail,
  Save,
  User,
  UserCircle,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ImageCropper } from "@/components/ImageCropper";
import { toast } from "sonner";
import { ProfileLetterBadge } from "@/components/ProfileLetterBadge";

export const ProfileMenu = () => {
  const { user, profile, signOut, updateProfile } = useAuth();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEditDialog = () => {
    setDisplayName(profile?.display_name || "");
    setEditDialogOpen(true);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes", { position: "top-center" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 10MB", {
        position: "top-center",
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setCropperOpen(true);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user) return;

    setUploadingAvatar(true);
    try {
      const filePath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedBlob, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await updateProfile({
        avatar_url: `${urlData.publicUrl}?t=${Date.now()}`,
      });

      if (updateError) throw updateError;

      toast.success("Avatar actualizado", { position: "top-center" });
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast.error("Error al subir la imagen", { position: "top-center" });
    } finally {
      setUploadingAvatar(false);
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
        setImageToCrop(null);
      }
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile({
        display_name: displayName.trim() || null,
      });

      if (error) throw error;

      toast.success("Perfil actualizado", { position: "top-center" });
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Error al actualizar el perfil", { position: "top-center" });
    } finally {
      setSaving(false);
    }
  };

  // Si no hay user -> botón de entrar
  if (!user) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link to="/auth" className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Entrar</span>
        </Link>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full"
          >
            {profile?.avatar_url ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url} />
                </Avatar>

                <ProfileLetterBadge
                  name={profile?.display_name}
                  email={profile?.email}
                  className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-[8px]"
                />
              </>
            ) : (
              <UserCircle className="h-7 w-7 text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">
              {profile?.display_name ?? "Usuario"}
            </p>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleOpenEditDialog}>
            <User className="mr-2 h-4 w-4" />
            Editar perfil
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={signOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {profile?.avatar_url ? (
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage src={profile.avatar_url} />
                  </Avatar>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-secondary">
                    <UserCircle className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {profile?.avatar_url && (
                  <ProfileLetterBadge
                    name={profile?.display_name}
                    email={user?.email}
                    className="absolute -bottom-1 -right-1 h-7 w-7 text-xs"
                  />
                )}

                {/* Botón cámara (si lo quieres a la derecha, ajusta con right-... como hablamos antes) */}
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute -top-1 right-0 translate-x-1/3 rounded-full bg-secondary p-1.5 text-foreground ring-2 ring-background transition-colors hover:bg-secondary/80 disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Cambia tu foto de perfil
                </p>
                <p className="text-xs text-muted-foreground">Máximo 2MB</p>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Nombre
              </Label>
              <Input
                placeholder="Tu nombre"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 rounded-xl border-border bg-secondary"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="h-12 rounded-xl border-border bg-secondary/50 text-muted-foreground"
              />
            </div>

            {/* Save button */}
            <Button
              variant="glow"
              size="lg"
              className="w-full"
              onClick={handleSaveProfile}
              disabled={saving || displayName === (profile?.display_name || "")}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Cropper */}
      {imageToCrop && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={(open) => {
            setCropperOpen(open);
            if (!open && imageToCrop) {
              URL.revokeObjectURL(imageToCrop);
              setImageToCrop(null);
            }
          }}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};
