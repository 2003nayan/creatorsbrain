"use client";

import Form from "next/form";
import AnalyseButton from "./AnalyseButton";
import { analyseYoutubeVideo } from "@/actions/analyseYoutubeVideo";

function YoutubeVideoForm() {
  return (
    <>
      <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-md border max-w-xl mx-auto w-full">
        <span className="text-sm text-gray-500">Try with: </span>
        <code className="text-xs sm:text-sm bg-gray-100 py-1 rounded flex-1 overflow-x-auto">
          https://www.youtube.com/watch?v=wUh9jomHZp4
        </code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              "https://www.youtube.com/watch?v=wUh9jomHZp4"
            );
            const button = document.getElementById("copy-button");
            if (button) {
              button.textContent = "Copied!";
              setTimeout(() => {
                button.textContent = "Copy";
              }, 2000);
            }
          }}
          id="copy-button"
          className="px-3 py-1 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-md"
        >
          Copy
        </button>
      </div>
      <div className="w-full max-w-2xl mx-auto">
        <Form
          action={analyseYoutubeVideo}
          className="flex flex-col sm:flex-row gap-2 items-center"
        >
          <input
            name="url"
            type="text"
            placeholder="Enter YouTube URL"
            className="flex-1 w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <AnalyseButton />
        </Form>
      </div>
    </>
  );
}

export default YoutubeVideoForm;
