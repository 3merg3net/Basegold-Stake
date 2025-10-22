export default function Loading() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <img
          src="/logo.png"
          alt="Base Gold"
          className="w-24 h-24 animate-pulse drop-shadow-[0_0_16px_rgba(212,175,55,0.55)]"
        />
        <div className="text-gold font-semibold tracking-wide">Syncing Vault Data…</div>
        <div className="w-52 h-1 rounded bg-white/10 overflow-hidden">
          <div className="h-full w-1/3 animate-[loadingbar_1.2s_ease-in-out_infinite] bg-gold" />
        </div>
      </div>
    </div>
  );
}
