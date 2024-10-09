
function ShowInterstitial_Preroll() {
	c3_callFunction("ForceMute", []);
}
function ShowInterstitial_Next() {
	c3_callFunction("ForceMute", []);
}
function ShowRewarded() {
	c3_callFunction("ForceMute", []);
	c3_callFunction("RewardedAdWatched", []);
	c3_callFunction("ForceUnmute", []);
}