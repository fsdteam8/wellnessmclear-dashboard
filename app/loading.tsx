import { PuffLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Optional: Remove this if you only want MoonLoader */}
        {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div> */}
        <PuffLoader
          color="rgba(49, 23, 215, 1)"
          cssOverride={{}}
          loading
          speedMultiplier={1}
        />
      </div>
    </div>
  );
}
