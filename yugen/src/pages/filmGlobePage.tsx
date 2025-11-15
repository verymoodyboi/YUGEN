import AppLayout from "../layouts/layout-main";

import FilmGlobe from "../features/globe/components/filmGlobe";

export default function FilmGlobePage(): JSX.Element {
  return (
    <AppLayout>
      <div className="h-[100%] text-emerald-950 font-freckle overflow-hidden border-emerald-150 border-2 border-dashed">
        <FilmGlobe />
      </div>
    </AppLayout>
  );
}
