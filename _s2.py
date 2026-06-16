c=open("C:/Projects/HTRGroupLLC/_revsec_bundle.txt",encoding="utf-8").read()
for pat in ["writeReview","reviewsH2","google.com/maps","RefreshCw","4285F4","filteredReviews","_dailyMix","line-clamp"]:
    print(pat, c.find(pat))
