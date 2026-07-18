# Coverage lineage in two snapshots

JobPilot publishes two different counting populations. They should not be compared as if one were a refresh of the other.

| Frozen point | What it counted | Certified total | Meaning |
| --- | --- | ---: | --- |
| 2026-07-16, JP-41 | One bounded private-shadow acquisition generation | 2,808 | Source postings, canonical jobs, and private-index records reconciled inside generation `cmrn2qtbx00005cvvdx45wbs8`. |
| 2026-07-18, Build Week credibility RC | The later active `Job` catalog after subsequent acquisition and refresh generations | 145,978 | Unique active `Job.id` rows at read version `9153132:9153132:`. |

The larger number is not “the same 2,808 catalog after a refresh.” JP-41 certified one generation-scoped slice. The Build Week snapshot measures the broader, later active catalog supplied by 473 active official-source endpoints.

California is a unique-job count. Bay Area and Los Angeles County figures are distinct active-job memberships in exact market contracts. Market memberships can overlap, so they are disclosed separately and are never added to the catalog total.

The Los Angeles public label and query use `LOS_ANGELES_COUNTY`, the county-only JP-41 contract. “Greater Los Angeles” is not used as a substitute.

Full definitions, hashes, and no-double-counting proof are in `coverage-lineage.json` and `coverage-methodology.md`.
