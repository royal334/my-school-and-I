export function EarnBadge() {
  return (
    <div className="mx-4 mt-3 flex items-center gap-2.5 rounded border border-warning/25 bg-warning-bg px-3.5 py-2.5">
      <span className="text-xl">🏆</span>
      <p className="text-xs leading-normal text-warning-text">
        If this property is verified and rented through Campus&Me, you earn a referral reward.
        10% of the earnings is given to the platform, 5% to the platform agent and 5% to the referrer.
      </p>
    </div>
  );
}