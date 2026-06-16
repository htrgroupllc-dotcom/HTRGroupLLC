chunk=open("C:/Projects/HTRGroupLLC/_bundle_home.txt",encoding="utf-8").read()
i=chunk.find("_dailyMix")
open("C:/Projects/HTRGroupLLC/_daily_mix_ctx.txt","w",encoding="utf-8").write(chunk[i-500:i+12000])
print("written", i)
