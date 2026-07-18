# Nearby Discovery

Nearby discovery uses user-configured home city, latitude, longitude, preferred radius, accepted work modes, and remote preference. It never requests browser geolocation and calls no map or geocoding service.

Physical distance uses deterministic Haversine miles to the nearest valid job location. Remote-only roles display `Remote` rather than an invented distance. A role is within the preferred area when its nearest physical location is inside the radius or its remote mode matches the configured preference.

Visible sorts:

- **Best Match:** numeric eligibility, confirmed blocker count, Fit Score, Evidence Quality, physical distance when applicable, posting date, stable job ID.
- **Nearest:** physical distance, then posting date and job ID; remote-only roles follow physical locations.
- **Most Recent:** posting time, then job ID.
- **Highest Evidence Quality:** Evidence Quality, Fit Score, then job ID.

Filters cover title/company query, work mode, seniority, minimum Fit Score, evidence sufficiency, priority, blocker state, preferred radius, and remote compatibility.

Distance, configured location, remote preference, work mode, recency, and source never change technical capability points. Tests verify known distance, multi-location minimum, Remote labeling, every sort/filter, stable ties, and unchanged class totals when coordinates move.
