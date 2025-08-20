import React from "react";
import DynamicFormFormik from "./DynamicFormFormik";

export default function ClientPreview({ form = {} }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-50 font-sans flex flex-col">
      {/* Skeleton Header */}
      <header className="bg-blue-900 py-6 shadow flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 min-w-[64px] min-h-[64px] bg-blue-400 rounded-full animate-pulse" />
          <div className="h-8 w-40 min-h-[32px] min-w-[160px] bg-blue-300 rounded animate-pulse" />
        </div>
      </header>

      {/* Skeleton Hero Section */}
      <section className="relative flex items-center justify-center mb-8">
        <DynamicFormFormik
          form={form}
          onSubmit={(values) => console.log(values)}
        />
      </section>
      {/* <section className="relative h-72 sm:h-96 flex items-center justify-center mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-blue-200 opacity-80" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-32 h-32 min-w-[128px] min-h-[128px] bg-blue-300 rounded-full animate-pulse" />
          <div className="h-10 w-64 min-h-[40px] min-w-[256px] bg-blue-200 rounded animate-pulse" />
          <div className="h-6 w-40 min-h-[24px] min-w-[160px] bg-blue-100 rounded animate-pulse" />
        </div>
      </section> */}

      {/* Skeleton Offers Section */}
      <section className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-blue-50 rounded-lg shadow p-6 flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 min-w-[80px] min-h-[80px] bg-blue-300 rounded-full animate-pulse" />
            <div className="h-6 w-32 min-h-[24px] min-w-[128px] bg-blue-200 rounded animate-pulse" />
            <div className="h-4 w-24 min-h-[16px] min-w-[96px] bg-blue-100 rounded animate-pulse" />
          </div>
        ))}
      </section>

      {/* Skeleton Booking Form Card */}
      {/* <main className="flex-1 flex items-center justify-center">
        <DynamicFormFormik
          pages={form.pages}
          settings={form.settings}
          onSubmit={(values) => console.log(values)}
        />
      </main> */}

      {/* Skeleton Footer */}
      <footer className="bg-blue-900 py-8 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
          <div className="h-6 w-32 min-h-[24px] min-w-[128px] bg-blue-400 rounded animate-pulse" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 min-w-[32px] min-h-[32px] bg-blue-300 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
