import { EntityDiff } from "@data-refinery/schema";

/**
 * Computes semantic diff between previous structured data and current structured data
 */
export function computeEntityDiff(
  domain: "developer" | "pricing" | "regulatory" | "custom",
  entityKey: string,
  previousData: any,
  currentData: any
): Omit<EntityDiff, "id" | "detectedAt"> | null {
  if (!previousData) {
    return null; // First version, no diff
  }

  const changes: Array<{
    field: string;
    changeType: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
    oldValue?: any;
    newValue?: any;
    significance: string;
  }> = [];

  let severity: "CRITICAL" | "MAJOR" | "MINOR" | "INFORMATIONAL" = "INFORMATIONAL";

  if (domain === "developer") {
    // Check breaking changes and deprecations
    const oldBreaking = Array.isArray(previousData.breakingChanges) ? previousData.breakingChanges : [];
    const newBreaking = Array.isArray(currentData.breakingChanges) ? currentData.breakingChanges : [];

    if (newBreaking.length > oldBreaking.length) {
      severity = "CRITICAL";
      changes.push({
        field: "breakingChanges",
        changeType: "ADDED",
        oldValue: `${oldBreaking.length} breaking changes`,
        newValue: `${newBreaking.length} breaking changes`,
        significance: `Added ${newBreaking.length - oldBreaking.length} new breaking change(s)`
      });
    }

    if (previousData.version !== currentData.version) {
      changes.push({
        field: "version",
        changeType: "MODIFIED",
        oldValue: previousData.version,
        newValue: currentData.version,
        significance: `Version bumped from ${previousData.version} to ${currentData.version}`
      });
      if (severity === "INFORMATIONAL") severity = "MINOR";
    }
  } else if (domain === "pricing") {
    // Check pricing tiers and cost changes
    const oldTiers: any[] = previousData.tiers || [];
    const newTiers: any[] = currentData.tiers || [];

    for (const newTier of newTiers) {
      const matchOld = oldTiers.find((t: any) => t.name.toLowerCase() === newTier.name.toLowerCase());
      if (!matchOld) {
        changes.push({
          field: `tier:${newTier.name}`,
          changeType: "ADDED",
          newValue: `$${newTier.monthlyPrice}/mo`,
          significance: `New pricing tier added: ${newTier.name}`
        });
        if (severity !== "CRITICAL") severity = "MAJOR";
      } else if (matchOld.monthlyPrice !== newTier.monthlyPrice) {
        const isIncrease = (newTier.monthlyPrice || 0) > (matchOld.monthlyPrice || 0);
        if (isIncrease) severity = "CRITICAL";
        changes.push({
          field: `tier:${newTier.name}:monthlyPrice`,
          changeType: "MODIFIED",
          oldValue: matchOld.monthlyPrice,
          newValue: newTier.monthlyPrice,
          significance: `Price ${isIncrease ? "increased" : "decreased"} from $${matchOld.monthlyPrice} to $${newTier.monthlyPrice}`
        });
      }
    }
  } else if (domain === "regulatory") {
    const oldReqs: any[] = previousData.requirements || [];
    const newReqs: any[] = currentData.requirements || [];

    if (newReqs.length > oldReqs.length) {
      severity = "MAJOR";
      changes.push({
        field: "requirements",
        changeType: "ADDED",
        oldValue: `${oldReqs.length} rules`,
        newValue: `${newReqs.length} rules`,
        significance: `New regulatory requirements or permit rules introduced`
      });
    }
  }

  // Generalized fallback comparison if no specific domain diff matched
  if (changes.length === 0) {
    const prevKeys = Object.keys(previousData);
    const currKeys = Object.keys(currentData);

    for (const key of currKeys) {
      if (JSON.stringify(previousData[key]) !== JSON.stringify(currentData[key])) {
        changes.push({
          field: key,
          changeType: prevKeys.includes(key) ? "MODIFIED" : "ADDED",
          significance: `Field ${key} was updated`
        });
      }
    }
  }

  if (changes.length === 0) {
    return null; // Identical, no diff detected
  }

  const diffSummary = `${changes.length} change(s) detected with severity ${severity}. Key highlights: ${changes.map(c => c.significance).slice(0, 3).join("; ")}`;

  return {
    entityKey,
    domain,
    previousVersion: previousData.version || previousData.lastUpdated || "previous",
    currentVersion: currentData.version || currentData.lastUpdated || "latest",
    severity,
    diffSummary,
    changes
  };
}
