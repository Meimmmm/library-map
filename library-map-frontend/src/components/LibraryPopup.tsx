// library-map-frontend/src/components/LibraryPopup.tsx
import type { Library } from "../types/library";
import type { LibraryStatus } from "../utils/openingHoursUtils";
import { getGoogleMapsSearchUrl, getGoogleMapsDirectionsUrl } from "../utils/mapLinkUtils";

interface LibraryPopupProps {
    lib: Library;
    status: LibraryStatus;
}

export default function LibraryPopup({
    lib,
    status,
}: LibraryPopupProps) {

    const mapUrl = getGoogleMapsSearchUrl({
        name: lib.name,
        address: lib.address,
    });

    const directionsUrl = getGoogleMapsDirectionsUrl({
        lat: lib.lat,
        lng: lib.lon,
        travelMode: "walking",
    });

    return (
        <div className="min-w-[30ch]">
            <div className="text-base font-semibold mb-1">{lib.name}</div>

            {/* Show this only if the variable exists */}
            {lib.openingHoursJson && (
                <div className="text-sm text-slate-500 mb-2">
                    {status.label}
                </div>
            )}

            {lib.address && (
                <div className="text-xs text-slate-500 mb-3">
                    {lib.address}
                </div>
            )}

            {/* Primary actions */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                {mapUrl && (
                    <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                        📍 Maps
                    </a>
                )}

                {directionsUrl && (
                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 rounded-lg bg-blue-100 px-2 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                    >
                        ➡️ Directions
                    </a>
                )}
            </div>

            {/* Secondary links */}
            <div className="flex flex-col gap-1">
                {lib.websiteUrl && (
                    <a
                        href={lib.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        🌐 Library Website
                    </a>
                )}

                {lib.websiteUrl2 && (
                    <a
                        href={lib.websiteUrl2}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        🕒 Opening Hours Web Page
                    </a>
                )}
            </div>
        </div>
    );
}
