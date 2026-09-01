import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  LoaderCircle,
} from "lucide-react";
import { getAIInsights } from "../api";

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAIInsights();

      setInsights(res.data?.insights || null);
      setOpen(true);
    } catch (err) {
      console.error("AI insights error:", err);

      setError(
        "Couldn't generate insights right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!insights && !loading) {
      loadInsights();
      return;
    }

    setOpen((prev) => !prev);
  };

  return (
    <section className="mt-5 w-full">

      {/* ==================================================
          AI CARD
      ================================================== */}

      <div
        className="
          w-full
          rounded-2xl
          border
          border-slate-800
          bg-slate-900/60
          overflow-hidden
        "
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className="
            w-full
            px-4
            py-3.5
            flex
            items-center
            gap-3
            text-left
            hover:bg-slate-800/30
            transition
          "
        >

          {/* Icon */}

          <div
            className="
              w-9
              h-9
              shrink-0
              rounded-xl
              bg-violet-400/10
              flex
              items-center
              justify-center
            "
          >
            {loading ? (
              <LoaderCircle
                size={17}
                className="
                  text-violet-400
                  animate-spin
                "
              />
            ) : (
              <Sparkles
                size={17}
                className="text-violet-400"
              />
            )}
          </div>

          {/* Title */}

          <div className="flex-1 min-w-0">

            <p className="text-sm font-medium text-slate-200">
              AI Training Insights
            </p>

            <p className="text-[10px] text-slate-600 mt-0.5">
              {loading
                ? "Analyzing your training..."
                : insights
                ? "Based on your workout history"
                : "Discover patterns in your training"}
            </p>

          </div>

          {/* Right side */}

          {!loading && (
            <div className="shrink-0">

              {insights ? (
                open ? (
                  <ChevronUp
                    size={17}
                    className="text-slate-600"
                  />
                ) : (
                  <ChevronDown
                    size={17}
                    className="text-slate-600"
                  />
                )
              ) : (
                <span
                  className="
                    text-[10px]
                    font-medium
                    text-violet-400
                  "
                >
                  Analyze
                </span>
              )}

            </div>
          )}

        </button>

        {/* ==================================================
            LOADING STATE
        ================================================== */}

        {loading && (
          <div className="px-4 pb-4">

            <div className="pt-1 space-y-2.5">

              <div
                className="
                  h-2.5
                  w-[85%]
                  rounded-full
                  bg-slate-800
                  animate-pulse
                "
              />

              <div
                className="
                  h-2.5
                  w-[65%]
                  rounded-full
                  bg-slate-800
                  animate-pulse
                "
              />

              <div
                className="
                  h-2.5
                  w-[75%]
                  rounded-full
                  bg-slate-800
                  animate-pulse
                "
              />

            </div>

            <p className="text-[10px] text-slate-600 mt-3">
              This can take a few seconds...
            </p>

          </div>
        )}

        {/* ==================================================
            ERROR STATE
        ================================================== */}

        {!loading && error && (
          <div className="px-4 pb-4">

            <div
              className="
                flex
                items-start
                gap-2.5
                p-3
                rounded-xl
                bg-red-400/5
                border
                border-red-400/10
              "
            >

              <AlertCircle
                size={15}
                className="
                  text-red-400
                  shrink-0
                  mt-0.5
                "
              />

              <div className="flex-1">

                <p className="text-xs text-slate-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadInsights}
                  className="
                    mt-2
                    text-[10px]
                    text-red-400
                    hover:text-red-300
                    transition
                  "
                >
                  Try again
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            INSIGHTS CONTENT
        ================================================== */}

        {!loading &&
          !error &&
          insights &&
          open && (

            <div className="px-4 pb-4">

              {/* Divider */}

              <div className="h-px bg-slate-800 mb-4" />

              {/* ==================================================
                  SUMMARY
              ================================================== */}

              {insights.summary && (
                <div className="mb-5">

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-slate-600
                      mb-1.5
                    "
                  >
                    Your training
                  </p>

                  <p
                    className="
                      text-xs
                      sm:text-sm
                      leading-relaxed
                      text-slate-300
                    "
                  >
                    {insights.summary}
                  </p>

                </div>
              )}

              {/* ==================================================
                  HIGHLIGHTS
              ================================================== */}

              {insights.highlights?.length > 0 && (
                <div className="mb-5">

                  <div className="flex items-center gap-1.5 mb-2">

                    <TrendingUp
                      size={13}
                      className="text-emerald-400"
                    />

                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-wider
                        text-slate-600
                      "
                    >
                      Going well
                    </p>

                  </div>

                  <div className="space-y-2">

                    {insights.highlights.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="
                            rounded-xl
                            bg-emerald-400/[0.03]
                            border
                            border-emerald-400/10
                            px-3
                            py-2.5
                          "
                        >

                          <p
                            className="
                              text-xs
                              font-medium
                              text-slate-300
                            "
                          >
                            {item.title}
                          </p>

                          <p
                            className="
                              text-[11px]
                              leading-relaxed
                              text-slate-500
                              mt-1
                            "
                          >
                            {item.description}
                          </p>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

              {/* ==================================================
                  AREAS TO IMPROVE
              ================================================== */}

              {insights.areasToImprove?.length > 0 && (
                <div className="mb-5">

                  <div className="flex items-center gap-1.5 mb-2">

                    <AlertCircle
                      size={13}
                      className="text-amber-400"
                    />

                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-wider
                        text-slate-600
                      "
                    >
                      Pay attention to
                    </p>

                  </div>

                  <div className="space-y-2">

                    {insights.areasToImprove.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="
                            rounded-xl
                            bg-amber-400/[0.03]
                            border
                            border-amber-400/10
                            px-3
                            py-2.5
                          "
                        >

                          <p
                            className="
                              text-xs
                              font-medium
                              text-slate-300
                            "
                          >
                            {item.title}
                          </p>

                          <p
                            className="
                              text-[11px]
                              leading-relaxed
                              text-slate-500
                              mt-1
                            "
                          >
                            {item.description}
                          </p>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

              {/* ==================================================
                  RECOMMENDATIONS
              ================================================== */}

              {insights.recommendations?.length > 0 && (
                <div>

                  <div className="flex items-center gap-1.5 mb-2">

                    <Lightbulb
                      size={13}
                      className="text-sky-400"
                    />

                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-wider
                        text-slate-600
                      "
                    >
                      Next steps
                    </p>

                  </div>

                  <div className="space-y-2">

                    {insights.recommendations.map(
                      (recommendation, index) => (
                        <div
                          key={index}
                          className="
                            flex
                            items-start
                            gap-2.5
                          "
                        >

                          <span
                            className="
                              w-4
                              h-4
                              shrink-0
                              rounded-full
                              bg-sky-400/10
                              text-sky-400
                              flex
                              items-center
                              justify-center
                              text-[9px]
                              mt-0.5
                            "
                          >
                            {index + 1}
                          </span>

                          <p
                            className="
                              text-[11px]
                              leading-relaxed
                              text-slate-400
                            "
                          >
                            {recommendation}
                          </p>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

              {/* ==================================================
                  REFRESH
              ================================================== */}

              <div className="pt-4 flex justify-end">

                <button
                  type="button"
                  onClick={loadInsights}
                  className="
                    flex
                    items-center
                    gap-1.5
                    text-[10px]
                    text-slate-600
                    hover:text-violet-400
                    transition
                  "
                >
                  <RefreshCw size={11} />

                  Refresh insights
                </button>

              </div>

            </div>
          )}

      </div>

    </section>
  );
};

export default AIInsights;