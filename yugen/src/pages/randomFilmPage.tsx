import AppLayout from "../layouts/layout-main";
import FilmPicker from "../features/explore/components/filmPicker";

export default function RandomFilmPage(): JSX.Element {
  return (
    <AppLayout>
      <div className="min-h-screen bg-emerald-50 text-emerald-950 font-freckle py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl">Film Roll Picker</h1>
            <div className="text-sm italic">Random film experience</div>
          </div>
          <FilmPicker />
        </div>
      </div>
    </AppLayout>
  );
}
