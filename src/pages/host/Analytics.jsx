import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiDownload, FiDollarSign } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import Layout from '../../components/Layout';
import { DateRangeModal } from '../../components/Search';
import { Thumb } from './HostShared';
import { img, LOREM_SHORT } from '../../data';
import { apiRequest, downloadFile } from '../../lib/api';

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/* Figma: "MacBook Pro 14 - 47" — Host Analytics (Earnings, Payouts, Performance, Ratings) */
export default function Analytics() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [cal, setCal] = useState(false);
  const [all, setAll] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  const [earningsData, setEarningsData] = useState(null);
  const [payoutsData, setPayoutsData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [replyText, setReplyText] = useState('');
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [earnRes, payoutRes, perfRes, revRes, sumRes, vehRes] = await Promise.all([
        apiRequest(`/host/earnings?year=${selectedYear}`).catch(() => null),
        apiRequest('/host/payouts').catch(() => null),
        apiRequest('/bookings/performance/mine').catch(() => null),
        apiRequest('/reviews/host/mine').catch(() => null),
        apiRequest('/reviews/host/mine/summary').catch(() => null),
        apiRequest('/vehicles').catch(() => null),
      ]);

      if (earnRes?.data) setEarningsData(earnRes.data);
      if (payoutRes?.data) setPayoutsData(payoutRes.data);
      if (perfRes?.data) setPerformanceData(perfRes.data);
      if (Array.isArray(revRes?.data)) setReviewsData(revRes.data);
      if (sumRes?.data) setReviewSummary(sumRes.data);
      if (Array.isArray(vehRes?.data)) setVehicles(vehRes.data);
    } catch (err) {
      console.warn('Could not load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear]);

  const handleDownloadCsv = async () => {
    if (downloadingCsv) return;
    setDownloadingCsv(true);
    try {
      await downloadFile(`/host/earnings/export/csv?year=${selectedYear}`, `earnings_${selectedYear}.csv`);
    } catch (err) {
      console.warn('Download CSV error:', err);
      alert(err.message || 'Failed to download earnings CSV.');
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handlePostResponse = async (reviewId) => {
    if (!replyText.trim() || submittingReply) return;
    setSubmittingReply(true);
    try {
      await apiRequest(`/reviews/${reviewId}/response`, {
        method: 'POST',
        body: { text: replyText.trim() },
      });
      setReplyText('');
      setActiveReviewId(null);
      fetchAnalytics();
    } catch (err) {
      alert(err.message || 'Failed to post public response.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Monthly values for chart
  const monthlyValues = MONTH_NAMES.map((_, i) => {
    if (earningsData?.monthly && earningsData.monthly[i]) {
      return earningsData.monthly[i].earnings || 0;
    }
    return 0;
  });

  const maxEarningVal = Math.max(...monthlyValues, 1000);
  const maxAxis = Math.ceil(maxEarningVal / 1000) * 1000;

  const yTicks = [maxAxis, Math.round(maxAxis * 0.75), Math.round(maxAxis * 0.5), Math.round(maxAxis * 0.25), 0];

  const legend = [
    ['trip', `$${(earningsData?.tripEarnings ?? 0).toLocaleString()}`, 'Trip earnings'],
    ['upcoming', `$${(earningsData?.upcomingEarnings ?? 0).toLocaleString()}`, 'Upcoming earnings'],
    ['reimb', `$${(earningsData?.reimbursements ?? 0).toLocaleString()}`, 'Reimbursements'],
    ['incent', `$${(earningsData?.incentives ?? 0).toLocaleString()}`, 'Incentives'],
    ['missed', `$${(earningsData?.missedEarnings ?? 0).toLocaleString()}`, 'Missed earnings'],
  ];

  // Dynamic Performance
  const perfList = [
    ['Cancellation rate', `${performanceData?.cancellationRate ?? '0.0'}%`, 'All-Star Host: 3%'],
    ['Five-star rate', `${performanceData?.fiveStarRate ?? '100'}%`, 'All-Star Host: 86%'],
    ['Maintenance rate', `${performanceData?.maintenanceRate ?? '100'}%`, 'All-Star Host: 80%'],
    ['Cleanliness rate', `${performanceData?.cleanlinessRate ?? '100'}%`, 'All-Star Host: 80%'],
    ['Completed trips', String(performanceData?.completedTrips ?? 0), 'All-Star Host: 20*'],
  ];

  const catPercents = reviewSummary?.categoryPercents || {};
  const catsList = [
    ['Maintenance', `${catPercents.maintenance ?? 100}%`],
    ['Cleanliness', `${catPercents.cleanliness ?? 100}%`],
    ['Accuracy', `${catPercents.accuracy ?? 100}%`],
    ['Communication', `${catPercents.communication ?? 100}%`],
    ['Convenience', `${catPercents.convenience ?? 100}%`],
  ];

  const displayedReviews = all ? reviewsData : reviewsData.slice(0, 5);

  return (
    <Layout role="host">
      <div className="container analytics">
        <div className="page-title">
          <div>
            <h1 className="h-md">Earnings &amp; Payouts</h1>
            <p>Track your fleet revenue, completed trip shares, payouts, and customer ratings.</p>
          </div>
          <div className="month-nav month-nav--sm">
            <button type="button" aria-label="Previous Year" onClick={() => setSelectedYear(selectedYear - 1)}>
              <FiChevronLeft />
            </button>
            <span className="month-nav__label" style={{ fontWeight: 600, padding: '0 12px' }}>
              {selectedYear}
            </span>
            <button type="button" aria-label="Next Year" onClick={() => setSelectedYear(selectedYear + 1)}>
              <FiChevronRight />
            </button>
          </div>
        </div>

        {payoutsData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', margin: '20px 0 28px' }}>
            <div style={{ background: '#f8fafc', padding: '18px 22px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Paid Out</span>
              <h3 style={{ fontSize: '26px', color: '#0f172a', margin: '4px 0 0' }}>${(payoutsData.totalPaid || 0).toLocaleString()}</h3>
            </div>
            <div style={{ background: '#f8fafc', padding: '18px 22px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Pending Balance</span>
              <h3 style={{ fontSize: '26px', color: '#0284c7', margin: '4px 0 0' }}>${(payoutsData.totalPending || 0).toLocaleString()}</h3>
            </div>
            <div style={{ background: '#ecfdf5', padding: '18px 22px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '13px', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>Total Earned ({selectedYear})</span>
              <h3 style={{ fontSize: '26px', color: '#065f46', margin: '4px 0 0' }}>${(earningsData?.totalEarned || 0).toLocaleString()}</h3>
            </div>
          </div>
        )}

        <div className="earn-head">
          <div>
            <h2>${(earningsData?.totalEarned ?? 0).toLocaleString()} earned in {selectedYear}</h2>
            <small>Platform commissions and earnings adjustments automatically calculated.</small>
          </div>
          <button type="button" className="chip-btn chip-btn--white" onClick={handleDownloadCsv} disabled={downloadingCsv}>
            <FiDownload /> {downloadingCsv ? 'Downloading...' : 'Download CSV'}
          </button>
        </div>

        <div className="chart">
          <div className="chart__plot">
            {yTicks.map((v) => (
              <div className="chart__grid" key={v} style={{ bottom: `${maxAxis > 0 ? (v / maxAxis) * 100 : 0}%` }}>
                <span>${v.toLocaleString()}</span>
              </div>
            ))}
            <div className="chart__bars">
              {MONTH_NAMES.map((m, i) => {
                const val = monthlyValues[i] || 0;
                const heightPct = maxAxis > 0 ? (val / maxAxis) * 100 : 0;
                return (
                  <div className="chart__col" key={m}>
                    <div className="chart__stack">
                      <i className="seg seg--trip" style={{ height: `${heightPct}%` }} title={`$${val.toFixed(2)}`} />
                    </div>
                    <span>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="chart__legend">
            {legend.map(([k, v, l]) => (
              <span key={k}>
                <i className={`seg seg--${k}`} /> <b>{v}</b> {l}
              </span>
            ))}
          </div>
        </div>

        <div className="earn-table">
          <div className="earn-table__head">
            <span>Fleet vehicles</span>
            <span>Vehicle Status</span>
          </div>
          {vehicles.length > 0 ? (
            vehicles.map((veh) => {
              const photo = veh.photos?.[0]?.url || (typeof veh.photos?.[0] === 'string' ? veh.photos[0] : null) || img('car-1.jpg');
              const name = `${veh.year || ''} ${veh.make || ''} ${veh.model || ''}`.trim();
              return (
                <div className="earn-table__row" key={veh._id || veh.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Thumb src={photo} small />
                    <div>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>{name}</strong>
                      <small style={{ display: 'block', color: '#64748b' }}>Plate: {veh.licensePlate || 'N/A'}</small>
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: veh.listingStatus === 'listed' ? '#dcfce7' : '#f1f5f9',
                    color: veh.listingStatus === 'listed' ? '#15803d' : '#64748b',
                    textTransform: 'capitalize',
                  }}>
                    {veh.listingStatus || 'Listed'}
                  </span>
                </div>
              );
            })
          ) : (
            <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>No vehicles currently registered in your fleet.</p>
          )}
        </div>

        <h2 className="h-md mt-xl">Performance</h2>
        <p className="lead-sm">Live host performance standards evaluated across all fleet bookings.</p>
        <div className="perf">
          <div className="perf__list">
            {perfList.map(([k, v, s]) => (
              <div className="perf__row" key={k}>
                <b>{k}</b>
                <div>
                  <span className="pill-green">{v}</span>
                  <small>{s}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="tips-card">
            <img src={img('helpful-tips.png')} alt="Helpful tips" />
            <h4>Performance tips</h4>
            <ol>
              <li>Maintain regular vehicle maintenance and keep maintenance logs updated.</li>
              <li>Provide clean, disinfected interiors before handing keys over to guests.</li>
              <li>Communicate promptly via in-app messaging when bookings are submitted.</li>
              <li>Keep accurate photos and descriptions to set clear expectations.</li>
              <li>Ensure punctual check-in and checkout instructions for a smooth experience.</li>
              <li>Encourage satisfied guests to leave reviews to boost your All-Star Host standing.</li>
            </ol>
          </div>
        </div>

        {/* Ratings & Reviews */}
        <h2 className="h-md mt-xl">Ratings &amp; reviews</h2>
        <p className="lead-sm">Review scores and direct guest feedback for your fleet.</p>
        <div className="ratings">
          <div>
            <h3>Ratings Breakdown</h3>
            <small className="muted-sm">Percentage of positive ratings across verified rentals</small>
            <div className="r-card">
              <div className="r-card__head">
                <b>Overall</b>
                <b>{reviewSummary?.overallPercent != null ? `${reviewSummary.overallPercent}%` : '100%'}</b>
              </div>
              {[
                ['5 stars', reviewSummary?.distribution?.[5] ? Math.round((reviewSummary.distribution[5] / (reviewSummary.totalReviews || 1)) * 100) : 100],
                ['4 stars', reviewSummary?.distribution?.[4] ? Math.round((reviewSummary.distribution[4] / (reviewSummary.totalReviews || 1)) * 100) : 0],
                ['3 stars', reviewSummary?.distribution?.[3] ? Math.round((reviewSummary.distribution[3] / (reviewSummary.totalReviews || 1)) * 100) : 0],
                ['2 stars', reviewSummary?.distribution?.[2] ? Math.round((reviewSummary.distribution[2] / (reviewSummary.totalReviews || 1)) * 100) : 0],
                ['1 stars', reviewSummary?.distribution?.[1] ? Math.round((reviewSummary.distribution[1] / (reviewSummary.totalReviews || 1)) * 100) : 0],
              ].map(([l, p]) => (
                <div className="r-bar" key={l}>
                  <span>{l}</span>
                  <i>
                    <b style={{ width: `${p}%` }} />
                  </i>
                  <span>{p}%</span>
                </div>
              ))}
              <div className="r-card__stats">
                <div>
                  <b>Trips</b>
                  <span>{performanceData?.completedTrips ?? 0}</span>
                </div>
                <div>
                  <b>Reviews</b>
                  <span>{reviewSummary?.totalReviews ?? reviewsData.length}</span>
                </div>
                <div>
                  <b>Average</b>
                  <span>
                    {reviewSummary?.average != null ? Number(reviewSummary.average).toFixed(1) : '5.0'} <FaStar color="#FDB022" />
                  </span>
                </div>
              </div>
            </div>
            {catsList.map(([t, p]) => (
              <div className="r-card" key={t}>
                <div className="r-card__head">
                  <b>{t}</b>
                  <b>{p}</b>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3>Guest Reviews</h3>
            <small className="muted-sm">Direct guest reviews received on your vehicles</small>
            {displayedReviews.length > 0 ? (
              displayedReviews.map((rev) => {
                const guestName = rev.reviewer ? `${rev.reviewer.firstName || ''} ${rev.reviewer.lastName || ''}`.trim() : 'Guest';
                const guestPhoto = rev.reviewer?.profilePhotoUrl || img('av-2.jpg');
                const rating = rev.overallRating || 5;
                const vehicleName = rev.vehicle ? `${rev.vehicle.year || ''} ${rev.vehicle.make || ''} ${rev.vehicle.model || ''}`.trim() : 'Rental Vehicle';
                const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent';
                return (
                  <div className="rv" key={rev._id} style={{ marginBottom: '18px' }}>
                    <img src={guestPhoto} alt="" />
                    <div style={{ flex: 1 }}>
                      <span className="stars-row stars-row--lg">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FaStar key={s} color={s <= rating ? '#FDB022' : '#E2E8F0'} />
                        ))}
                      </span>
                      <p className="rv__who">
                        {guestName} <span>•</span> {dateStr}
                      </p>
                      <p className="rv__car">{vehicleName}</p>
                      <p>{rev.comment || 'Smooth rental experience with this vehicle.'}</p>

                      {rev.hostResponse && (
                        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #2563eb', margin: '8px 0', fontSize: '13px' }}>
                          <strong style={{ color: '#0f172a' }}>Your response:</strong> {rev.hostResponse.text}
                        </div>
                      )}

                      {!rev.hostResponse && activeReviewId !== rev._id && (
                        <button type="button" className="btn-mini" onClick={() => setActiveReviewId(rev._id)}>
                          Leave a public response
                        </button>
                      )}

                      {activeReviewId === rev._id && (
                        <div style={{ marginTop: '10px' }}>
                          <textarea
                            placeholder="Write a public response to this review..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', minHeight: '60px' }}
                          />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              disabled={submittingReply || !replyText.trim()}
                              onClick={() => handlePostResponse(rev._id)}
                            >
                              {submittingReply ? 'Posting...' : 'Post Response'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => { setActiveReviewId(null); setReplyText(''); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#64748b', padding: '24px 0', textAlign: 'center' }}>No reviews received on your vehicles yet.</p>
            )}

            {reviewsData.length > 5 && (
              <div className="right">
                <button type="button" className="btn-mini btn-mini--dark" onClick={() => setAll(!all)}>
                  {all ? 'Show Less' : 'Show All'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {cal && <DateRangeModal onClose={() => setCal(false)} />}
    </Layout>
  );
}
