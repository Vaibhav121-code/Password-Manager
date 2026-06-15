const LoadingSpinner = ({ fullPage = false, label = "Loading" }) => (
  <div
    className={fullPage ? "loading-state loading-state-full" : "loading-state"}
    role="status"
  >
    <span className="spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

export default LoadingSpinner;
