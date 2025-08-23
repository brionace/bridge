import React from "react";
import { Wand2 } from "lucide-react";

export default function FormBuilderLeftPanel({
  leftCollapsed,
  setLeftCollapsed,
  pages,
  setPages,
  currentPage,
  setCurrentPage,
  addPage,
  removePage,
  extractAppliedStyleObjects,
  setShowStyleToolbox,
}) {
  return (
    <div className="border rounded p-3 overflow-auto">
      {leftCollapsed ? (
        <button
          className="px-2 py-1 rounded bg-gray-100 border"
          onClick={() => setLeftCollapsed(false)}
        >
          Show Pages
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">
              Pages{" "}
              <button
                className="bg-green-600 text-white px-2 py-1 rounded"
                onClick={addPage}
              >
                +
              </button>
            </h4>
            <button
              className="text-sm text-gray-600"
              onClick={() => setLeftCollapsed(true)}
            >
              Hide
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {pages.map((page, i) => (
              <div key={i} className="border rounded p-2">
                <button
                  className={`px-2 py-1 rounded text-left ${
                    i === currentPage ? "bg-blue-600 text-white" : "bg-gray-100"
                  }`}
                  onClick={() => setCurrentPage(i)}
                >
                  {page.pageName || `Page ${i + 1}`}
                </button>
                {/* Page name and style editor for current page */}
                {currentPage === i && (
                  <div className="mt-4">
                    <label>
                      <span className="text-sm text-gray-600 mb-1">
                        Page Name
                      </span>
                      <input
                        className="border p-2 rounded w-full mb-2"
                        type="text"
                        value={pages[currentPage].pageName || ""}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setPages((pages) =>
                            pages.map((page, idx) =>
                              idx === currentPage
                                ? { ...page, pageName: newName }
                                : page
                            )
                          );
                        }}
                        placeholder={`Page ${currentPage + 1}`}
                      />
                    </label>
                    {extractAppliedStyleObjects(pages[currentPage].style).map(
                      (opt) => (
                        <span
                          key={opt.css}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 rounded border text-xs gap-1"
                        >
                          {opt.icon}
                          <span>{opt.label}</span>
                          <button
                            className="ml-1 text-red-500 hover:text-red-700"
                            type="button"
                            onClick={() => {
                              setPages((pages) =>
                                pages.map((page, idx) =>
                                  idx === currentPage
                                    ? {
                                        ...page,
                                        style: (page.style || "")
                                          .replace(opt.css, "")
                                          .replace(/\s*;\s*;/g, ";")
                                          .trim(),
                                      }
                                    : page
                                )
                              );
                            }}
                          >
                            &times;
                          </button>
                        </span>
                      )
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="px-2 py-1 rounded bg-indigo-100 border inline-flex items-center gap-1"
                        type="button"
                        onClick={() =>
                          setShowStyleToolbox({
                            type: "page",
                            index: currentPage,
                          })
                        }
                      >
                        <Wand2 size={16} /> Style
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-2">
                  {i !== 0 && currentPage === i && (
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => removePage(currentPage)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
