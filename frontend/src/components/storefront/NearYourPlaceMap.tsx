import React from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

export default function NearYourPlaceMap() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">
          Near your place
        </h2>

        {/* Custom Stylized Map Box matching the reference image */}
        <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-slate-100">
          {/* Map Vector/Graphic Image */}
          <iframe
            title="Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.460233486121!2d106.6663248759537!3d10.776019489372588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752edb787532f1%3A0xb9d5714f6e626e47!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBOZ2_huqFpIE5n4buvIC0gVGluIEjhu41jIFRQLkhDTSAoSFVGTElUKQ!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'saturate(1.2)' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />

          {/* Location Marker Overlay Card */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-gray-950 font-bold">
              <MapPin className="w-4 h-4 fill-gray-950" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900">Main Station Hub</p>
              <p className="text-[11px] text-gray-500 font-medium">828 Sư Vạn Hạnh, Q.10 • 12 Cars Available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
