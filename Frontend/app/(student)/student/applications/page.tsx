"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { GuidedDemo } from "@/components/ui/GuidedDemo";
import { StatusText } from "@/components/ui/StatusText";
import { eventBus } from "@/lib/bus";

export default function StudentApplicationsPage() {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [docs, setDocs] = useState([
    { id: "1", name: "10th and 12th board transcripts", type: "Academic record", status: "Verified" },
    { id: "2", name: "B.Tech grade sheets (Sem 1 to 6)", type: "University record", status: "Verified" },
    { id: "3", name: "Aadhaar identification", type: "Identity record", status: "Verified" },
    { id: "4", name: "Pre-joining medical certificate", type: "Medical clearance", status: "Under review" },
    { id: "5", name: "Non-disclosure agreement", type: "Legal agreement", status: "Pending submission" },
  ]);

  const handleAccept = () => {
    setOfferAccepted(true);
    eventBus.publish({
      type: "OFFER_ISSUED",
      title: "Offer accepted",
      message: "Ananya Mohanty accepted the offer for Apex Cloud Technologies",
      companyName: "Apex Cloud Technologies",
    });
  };

  const handleVerify = (id: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Verified" } : d))
    );
  };

  return (
    <AppShell onStartWalkthrough={() => setShowWalkthrough(true)}>
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-4 hairline-b space-y-1">
          <h1 className="text-[20px] font-semibold text-ink tracking-tight">
            Offers & pre-employment documentation
          </h1>
          <p className="text-[13px] text-ink-3">
            Review employment offers and complete pre-joining compliance verifications.
          </p>
        </div>

        {/* Offer: Clean Definition List */}
        <div className="bg-surface hairline-all rounded-[12px] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 hairline-b">
            <div>
              <div className="text-[12px] text-ink-3 uppercase tracking-wider font-mono">
                Employment offer extended
              </div>
              <h2 className="text-[18px] font-semibold text-ink mt-0.5">
                Apex Cloud Technologies · Associate Cloud Engineer
              </h2>
            </div>

            <div>
              {offerAccepted ? (
                <div className="text-ok font-medium text-[13px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                  <span>Offer accepted</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAccept}
                  className="px-4 py-2 rounded-[8px] bg-accent text-white hover:bg-accent-hover text-[13px] font-medium transition-colors"
                >
                  Accept offer
                </button>
              )}
            </div>
          </div>

          {/* Definition List */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-[13px]">
            <div>
              <dt className="text-ink-3 text-[12px]">Total compensation</dt>
              <dd className="font-mono font-semibold text-ink text-[16px] mt-1 tabular-nums">
                34.0 LPA
              </dd>
            </div>
            <div>
              <dt className="text-ink-3 text-[12px]">Joining date</dt>
              <dd className="font-medium text-ink mt-1">July 2027</dd>
            </div>
            <div>
              <dt className="text-ink-3 text-[12px]">Primary location</dt>
              <dd className="font-medium text-ink mt-1">Bangalore / Hybrid</dd>
            </div>
            <div>
              <dt className="text-ink-3 text-[12px]">Response deadline</dt>
              <dd className="font-mono text-ink mt-1 tabular-nums">Oct 25, 2026</dd>
            </div>
          </dl>
        </div>

        {/* Documentation Table with Text Statuses */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[14px] font-semibold text-ink">
              Pre-joining compliance documents
            </h3>
            <span className="text-[12px] font-mono text-ink-3">
              {docs.filter((d) => d.status === "Verified").length} of {docs.length} verified
            </span>
          </div>

          <div className="overflow-x-auto hairline-all rounded-[12px] bg-surface">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="hairline-b bg-subtle text-ink-3 text-[12px]">
                  <th className="py-2.5 px-4 font-medium">Document name</th>
                  <th className="py-2.5 px-4 font-medium">Category</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink-2">
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="py-2.5 px-4 font-medium text-ink">{doc.name}</td>
                    <td className="py-2.5 px-4 text-ink-3">{doc.type}</td>
                    <td className="py-2.5 px-4">
                      <StatusText
                        status={
                          doc.status === "Verified"
                            ? "ok"
                            : doc.status === "Under review"
                            ? "warn"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {doc.status}
                      </StatusText>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {doc.status !== "Verified" && (
                        <button
                          type="button"
                          onClick={() => handleVerify(doc.id)}
                          className="text-[12px] text-accent hover:underline font-medium"
                        >
                          Upload file
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 18-Month Career Assurance as a Short Plain Note */}
        <div className="p-4 bg-subtle hairline-all rounded-[8px] space-y-1 text-[13px] text-ink-2">
          <div className="font-semibold text-ink">18-month career assurance policy</div>
          <p className="leading-relaxed">
            CampusLink continues monitoring career outcomes for 18 months post-graduation.
            If corporate restructuring or delayed joining occurs, priority alumni matching is activated.
          </p>
        </div>
      </div>

      {showWalkthrough && <GuidedDemo onClose={() => setShowWalkthrough(false)} />}
    </AppShell>
  );
}
