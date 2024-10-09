function ShowInterstitial_Preroll() {
    c2_callFunction("ForceMute", []);
}
function ShowInterstitial_Next() {
    c2_callFunction("ForceMute", []);
}
function ShowRewarded() {
    c2_callFunction("ForceMute", []);
    c2_callFunction("ForceUnmute", []);
    c2_callFunction("RewardedAdWatched", []);
}