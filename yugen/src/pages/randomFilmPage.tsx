import AppLayout from "../layouts/layout-main";
import FilmPicker from "../features/explore/components/filmPicker";

export default function RandomFilmPage(): JSX.Element {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-4xl font-bold border-b-4 border-emerald-950  pb-2">
          Random Film Picker{" "}
        </h1>
        <p className="text-sm text-emerald-900/70  mt-2 sm:mt-0">Surprise! </p>
      </div>
      <div className="min-h-screen  text-emerald-950 font-freckle py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-6"></div>
          <FilmPicker />
        </div>
      </div>
    </>
  );
}
