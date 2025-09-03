"use client";
import { useEffect, useRef, useState } from "react";

export type ProfileEditValues = {
  name: string;
  email?: string;
  bio?: string;
  phone: string;
  homepage_url: string;
  avatarUrl?: string;          // 미리보기/프론트용
  profile_image_url: string;   // 서버 저장용
};

export default function ProfileEditModal({
  open,
  onClose,
  initial,
  onSave,
  uploadEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/upload/profile-image`,
  meEndpoint = "/auth/me",
  loadMeOnOpen = true,   // 모달 열릴 때 /auth/me 불러와 initial을 덮어씀
}: {
  open: boolean;
  onClose: () => void;
  initial: ProfileEditValues;
  onSave: (values: ProfileEditValues) => void;
  uploadEndpoint?: string;
  meEndpoint?: string;
  loadMeOnOpen?: boolean;
}) {
  const [v, setV] = useState<ProfileEditValues>(initial);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);

  // initial 적용
  useEffect(() => {
    if (open) setV(initial);
  }, [open, initial]);

  // /auth/me 자동 로드 (옵션)
  useEffect(() => {
    let alive = true;
    if (!open || !loadMeOnOpen) return;
    (async () => {
      try {
        setLoadingMe(true);
        const res = await fetch(meEndpoint, { cache: "no-store", credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const me = await res.json();
        if (!alive) return;

        // 백엔드 응답 키를 유연하게 매핑
        const mapped: ProfileEditValues = {
          name: me?.name ?? v.name ?? "",
          email: me?.email ?? v.email ?? "",
          phone: me?.phone ?? v.phone ?? "",
          homepage_url: me?.homepage_url ?? v.homepage_url ?? "",
          profile_image_url: me?.profile_image_url ?? me?.avatarUrl ?? v.profile_image_url ?? "",
          avatarUrl: me?.avatarUrl ?? me?.profile_image_url ?? v.avatarUrl ?? "",
          bio: v.bio ?? "",
        };
        setV(mapped);
      } catch (e) {
        // 조용히 무시하고 initial 유지
        console.warn("Failed to load profile(me):", e);
      } finally {
        setLoadingMe(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, loadMeOnOpen, meEndpoint]); // v를 의존성에 넣지 않음(초기값 덮어쓰는 용도)

  // ESC 닫기 + 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  const openPicker = () => fileRef.current?.click();

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPickedFile(file);
    void upload(file);
  };

  const upload = async (file: File) => {
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(uploadEndpoint, { method: "POST", body: fd });

      let text = "";
      try { text = await res.text(); } catch {}
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}

      if (!res.ok) {
        throw new Error(
          data?.message || `Upload failed (HTTP ${res.status})${text ? " | " + text : ""}`
        );
      }

      // 서버가 어떤 키로 주든 최대한 유연하게 잡아주기
      const url =
        data.url || data.location || data.secure_url || data.profile_image_url || data.avatarUrl;
      if (!url) throw new Error("서버 응답에 url 필드가 없습니다.");

      setV((p) => ({
        ...p,
        avatarUrl: url,
        profile_image_url: url, // 서버 저장 필드도 함께 업데이트
      }));
    } catch (e: any) {
      setErr(e.message || "이미지 업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!v.name?.trim()) {
      setErr("이름을 입력해 주세요.");
      return;
    }

    // avatarUrl이 있다면 profile_image_url로도 반영된 상태이므로 그대로 전달
    onSave({
      ...v,
      profile_image_url: v.profile_image_url || v.avatarUrl || "",
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-[1001] w-[92vw] max-w-xl rounded-2xl border border-white/10 bg-white text-zinc-900 shadow-xl outline-none dark:bg-zinc-900 dark:text-zinc-100"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/10">
          <h2 className="text-base font-semibold">
            {loadingMe ? "프로필 불러오는 중…" : "프로필 편집"}
          </h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-5 py-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="h-20 w-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-8 00">
                {pickedFile || v.avatarUrl || v.profile_image_url ? (
                  <img
                    alt="avatar"
                    src={pickedFile ? URL.createObjectURL(pickedFile) : (v.avatarUrl || v.profile_image_url)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-xs text-zinc-400">
                    No Image
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePick}
                className="hidden"
              />
              <button
                type="button"
                onClick={openPicker}
                disabled={uploading}
                className="mt-2 h-8 w-full rounded-lg border border-zinc-300 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/10"
              >
                {uploading ? "업로드 중…" : (pickedFile || v.avatarUrl || v.profile_image_url ? "이미지 변경" : "이미지 선택")}
              </button>
            </div>

            {/* Fields */}
            <div className="grow space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  이름
                </label>
                <input
                  value={v.name}
                  onChange={(e) => setV((p) => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900"
                  placeholder="이름"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  이메일
                </label>
                <input
                  value={v.email ?? ""}
                  onChange={(e) => setV((p) => ({ ...p, email: e.target.value }))}
                  type="email"
                  className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900"
                  placeholder="이메일"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  전화번호
                </label>
                <input
                  value={v.phone}
                  onChange={(e) => setV((p) => ({ ...p, phone: e.target.value }))}
                  inputMode="tel"
                  className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900"
                  placeholder="전화번호"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  홈페이지 URL
                </label>
                <input
                  value={v.homepage_url}
                  onChange={(e) => setV((p) => ({ ...p, homepage_url: e.target.value }))}
                  inputMode="url"
                  className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900"
                  placeholder="https://example.com"
                />
              </div>

              {/* 필요 시 소개 활성화
              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  소개
                </label>
                <textarea
                  rows={4}
                  value={v.bio ?? ""}
                  onChange={(e) => setV((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900"
                  placeholder="간단한 소개를 작성하세요"
                />
              </div> */}
            </div>
          </div>

          {err && <p className="mt-3 text-xs text-red-400">{err}</p>}

          <div className="mt-5 flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border px-4 text-sm font-medium border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/10"
            >
              취소
            </button>
            <button
              type="submit"
              className="h-9 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-white/90"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
