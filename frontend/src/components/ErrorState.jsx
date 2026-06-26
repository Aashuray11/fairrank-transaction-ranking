export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-3xl border border-danger/30 bg-danger/10 p-6 text-danger">
      <p className="font-medium">{message || "Something went wrong"}</p>
      {onRetry ? (
        <button
          type="button"
          className="mt-3 rounded-xl bg-danger px-4 py-2 text-sm font-medium text-white"
          onClick={onRetry}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
