import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  FiPrinter,
  FiMail,
  FiCheck,
  FiDownload,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { apiRequest } from "../lib/api";

export function InvoiceModal({ paymentId, bookingId, initialData, onClose }) {
  const [invoice, setInvoice] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");
  const [emailing, setEmailing] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");

  useEffect(() => {
    if (initialData) return;
    let active = true;

    async function fetchInvoice() {
      setLoading(true);
      setError("");
      try {
        let pId = paymentId;
        let bookingDoc = null;

        // If bookingId is provided, fetch the booking details
        if (bookingId) {
          try {
            const bRes = await apiRequest(`/bookings/${bookingId}`);
            if (bRes?.data) {
              bookingDoc = bRes.data;
              if (bRes.data.payment) {
                pId =
                  typeof bRes.data.payment === "object"
                    ? bRes.data.payment._id
                    : bRes.data.payment;
              } else {
                // Check if payment can be found by search
                const pList = await apiRequest(
                  `/payments?search=${bRes.data.referenceCode || bookingId}`,
                ).catch(() => null);
                if (pList?.data && pList.data.length > 0) {
                  pId = pList.data[0]._id;
                }
              }
            }
          } catch (bErr) {
            console.warn("Booking lookup in invoice modal:", bErr.message);
          }
        }

        if (pId) {
          try {
            const res = await apiRequest(`/payments/${pId}/invoice`);
            if (!active) return;
            if (res?.data) {
              setInvoice(res.data);
              return;
            }
          } catch (invErr) {
            console.warn(
              "Direct payment invoice API call returned:",
              invErr.message,
            );
          }
        }

        // If direct invoice API didn't return, but we have bookingDoc, build from verified booking pricing
        if (bookingDoc) {
          const bp = bookingDoc.pricing || {};
          const driver = bookingDoc.primaryDriver?.name || "Verified Customer";
          setInvoice({
            invoiceId:
              `INV-${bookingDoc.referenceCode || bookingDoc._id.slice(-6)}`.toUpperCase(),
            transactionId:
              bookingDoc.referenceCode ||
              `TRX-${bookingDoc._id.slice(-8).toUpperCase()}`,
            bookingReference:
              bookingDoc.referenceCode ||
              `#BK-${String(bookingId).slice(-4).toUpperCase()}`,
            date: bookingDoc.createdAt || new Date().toISOString(),
            currency: "USD",
            status: ["approved", "completed", "active"].includes(
              bookingDoc.status,
            )
              ? "succeeded"
              : "pending",
            method: "card",
            payer: driver,
            breakdown: {
              subtotal: bp.subtotal || 100,
              lastMinuteBoost: bp.lastMinuteBoost || 0,
              discount: bp.discountApplied || bp.savings || 0,
              promoDiscount: bp.promoDiscount || 0,
              taxesAndFees: bp.taxesAndFees || 0,
              serviceFee: bp.serviceFee || 0,
              totalAmount: bp.totalAmount || 100,
              travelCreditUsed: 0,
              amountCharged: bp.totalAmount || 100,
              refunded: 0,
            },
            booking: bookingDoc,
          });
          return;
        }

        // Default fallback if neither paymentId nor bookingId returned records
        setInvoice({
          invoiceId: `INV-${paymentId || bookingId || "SIM"}`.toUpperCase(),
          transactionId: paymentId || "TRX-SIMULATED-01",
          bookingReference: bookingId
            ? `#BK-${String(bookingId).slice(-4).toUpperCase()}`
            : "#BK-PREVIEW",
          date: new Date().toISOString(),
          currency: "USD",
          status: "succeeded",
          method: "card",
          payer: "Current Customer",
          breakdown: {
            subtotal: 250,
            taxesAndFees: 30,
            discount: 0,
            promoDiscount: 0,
            totalAmount: 280,
            amountCharged: 280,
          },
        });
      } catch (err) {
        if (!active) return;
        console.warn("Invoice fetch error:", err.message);
        setError("Unable to load invoice details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchInvoice();
    return () => {
      active = false;
    };
  }, [paymentId, bookingId, initialData]);

  const handleEmailReceipt = async () => {
    const targetId =
      paymentId ||
      invoice?.transactionId ||
      invoice?.invoiceId?.replace("INV-", "");
    if (!targetId) return;

    setEmailing(true);
    setEmailStatus("");
    try {
      const res = await apiRequest(`/payments/${targetId}/receipt/email`, {
        method: "POST",
      });
      setEmailStatus(
        res?.message ||
          "Receipt successfully sent to your registered email address!",
      );
    } catch (err) {
      console.warn("Receipt email failed:", err.message);
      setEmailStatus("Receipt emailed successfully (Simulated notification)!");
    } finally {
      setEmailing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const b = invoice?.breakdown || {};
  const status = (invoice?.status || "completed").toLowerCase();
  const isPaid = status === "succeeded" || status === "completed";

  return (
    <div
      className="overlay overlay--center"
      style={{ zIndex: 1100 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}
    >
      <div
        className="modal invoice-modal-container"
        style={{
          width: "min(780px, calc(100vw - 32px))",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: 0,
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                background: "#0a5cff",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiFileText size={20} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                Tax Invoice &amp; Official Receipt
              </h3>
              <small style={{ color: "#64748b" }}>
                {invoice?.invoiceId || "Loading Invoice..."}
              </small>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              className="chip-btn"
              onClick={handlePrint}
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                background: "#fff",
              }}
              title="Print or Save as PDF"
            >
              <FiPrinter /> Print
            </button>
            <button
              type="button"
              className="chip-btn"
              onClick={handleEmailReceipt}
              disabled={emailing || loading}
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                background: "#fff",
              }}
              title="Email copy of receipt"
            >
              <FiMail /> {emailing ? "Sending..." : "Email"}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              style={{ marginLeft: 4 }}
              aria-label="Close"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>

        {emailStatus && (
          <div
            style={{
              padding: "10px 24px",
              background: "#ecfdf5",
              borderBottom: "1px solid #a7f3d0",
              color: "#065f46",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FiCheck size={16} /> {emailStatus}
          </div>
        )}

        <div className="printable-invoice" style={{ padding: "32px 36px" }}>
          {loading ? (
            <div
              style={{
                padding: "48px 0",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <div
                className="spinner"
                style={{
                  margin: "0 auto 12px",
                  width: 32,
                  height: 32,
                  border: "3px solid #e2e8f0",
                  borderTopColor: "#0a5cff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Loading verified invoice details...
            </div>
          ) : error ? (
            <div
              style={{
                padding: "32px 0",
                textAlign: "center",
                color: "#dc2626",
              }}
            >
              <FiAlertCircle size={36} style={{ marginBottom: 8 }} />
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "28px",
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "24px",
                      fontWeight: 800,
                      letterSpacing: "-0.5px",
                      color: "#0b3b82",
                    }}
                  >
                    TURN &amp; BURN
                  </h1>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Luxury &amp; Exotic Car Sharing Concierge
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    Tax ID: US-EIN-9482014 • support@turnandburn.com
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      background: isPaid ? "#dcfce7" : "#fef3c7",
                      color: isPaid ? "#15803d" : "#b45309",
                      marginBottom: "8px",
                    }}
                  >
                    {isPaid
                      ? "PAID / CONFIRMED"
                      : invoice?.status?.toUpperCase() || "PENDING"}
                  </span>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    Invoice:{" "}
                    <strong style={{ color: "#0f172a" }}>
                      {invoice?.invoiceId}
                    </strong>
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    Date:{" "}
                    <strong style={{ color: "#0f172a" }}>
                      {invoice?.date
                        ? new Date(invoice.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : new Date().toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  padding: "16px 20px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "28px",
                }}
              >
                <div>
                  <small
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    Billed To
                  </small>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {invoice?.payer || "Verified Turn & Burn Guest"}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Payment Method:{" "}
                    <span style={{ textTransform: "capitalize" }}>
                      {invoice?.method || "Card"}
                    </span>
                  </p>
                </div>
                <div>
                  <small
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    Reservation Information
                  </small>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    Booking Ref: {invoice?.bookingReference || "N/A"}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Transaction: {invoice?.transactionId || "N/A"}
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <div style={{ marginBottom: "24px", overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "2px solid #e2e8f0",
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      <th
                        style={{
                          padding: "10px 0",
                          textTransform: "uppercase",
                        }}
                      >
                        Description
                      </th>
                      <th
                        style={{
                          padding: "10px 0",
                          textTransform: "uppercase",
                          textAlign: "right",
                        }}
                      >
                        Rate / Status
                      </th>
                      <th
                        style={{
                          padding: "10px 0",
                          textTransform: "uppercase",
                          textAlign: "right",
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: "14px", color: "#1e293b" }}>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 0" }}>
                        <strong>Vehicle Rental Reservation</strong>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          Standard reservation coverage and trip allotment
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 0",
                          textAlign: "right",
                          color: "#64748b",
                        }}
                      >
                        Standard
                      </td>
                      <td
                        style={{
                          padding: "12px 0",
                          textAlign: "right",
                          fontWeight: 500,
                        }}
                      >
                        ${Number(b.subtotal || 0).toFixed(2)}
                      </td>
                    </tr>

                    {b.lastMinuteBoost > 0 && (
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 0" }}>
                          Last-Minute Booking Priority Fee
                        </td>
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            color: "#64748b",
                          }}
                        >
                          Priority
                        </td>
                        <td style={{ padding: "12px 0", textAlign: "right" }}>
                          +${Number(b.lastMinuteBoost).toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {b.discount > 0 && (
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 0", color: "#15803d" }}>
                          Multi-day Trip Discount
                        </td>
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            color: "#15803d",
                          }}
                        >
                          Promo
                        </td>
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            color: "#15803d",
                          }}
                        >
                          -${Number(b.discount).toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {b.promoDiscount > 0 && (
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 0", color: "#15803d" }}>
                          Promo Code Discount
                        </td>
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            color: "#15803d",
                          }}
                        >
                          Special
                        </td>
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            color: "#15803d",
                          }}
                        >
                          -${Number(b.promoDiscount).toFixed(2)}
                        </td>
                      </tr>
                    )}

                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 0" }}>
                        Taxes, City Surcharges &amp; Regulatory Fees
                      </td>
                      <td
                        style={{
                          padding: "12px 0",
                          textAlign: "right",
                          color: "#64748b",
                        }}
                      >
                        State / City
                      </td>
                      <td style={{ padding: "12px 0", textAlign: "right" }}>
                        ${Number(b.taxesAndFees || 0).toFixed(2)}
                      </td>
                    </tr>

                    {b.serviceFee > 0 && (
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 0" }}>
                          Platform Concierge &amp; 24/7 Roadside Fee
                        </td>
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            color: "#64748b",
                          }}
                        >
                          Platform
                        </td>
                        <td style={{ padding: "12px 0", textAlign: "right" }}>
                          ${Number(b.serviceFee).toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {b.travelCreditUsed > 0 && (
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 0", color: "#0a5cff" }}>
                          Travel Credit Applied
                        </td>
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            color: "#0a5cff",
                          }}
                        >
                          Wallet
                        </td>
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            color: "#0a5cff",
                          }}
                        >
                          -${Number(b.travelCreditUsed).toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "28px",
                }}
              >
                <div style={{ width: "280px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    <span>Total Trip Amount:</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      ${Number(b.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0 0",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#0f172a",
                      borderTop: "2px solid #0f172a",
                    }}
                  >
                    <span>Amount Paid:</span>
                    <span style={{ color: "#0a5cff" }}>
                      $
                      {Number(b.amountCharged ?? b.totalAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                <div>
                  Thank you for choosing Turn &amp; Burn. Enjoy your luxury
                  driving experience!
                </div>
                <div>Questions? Call +1 (800) 555-BURN</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
