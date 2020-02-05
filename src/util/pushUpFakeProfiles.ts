import Axios from "axios"
import { Profile } from "../models/Profile";
import { GeoPoint } from "../models/GeoPoint";
import { postSignup, postUserLocation, postProfileInfo } from "../data/dataApi";

const profiles = `/assets/data/profiles.json`

interface Data extends Profile{
  email: string,
}

export const fillProfiles = async () => {

  try {
    const localProfilesResponse = await Axios.request({
      url: profiles
    });
    const { data: localProfilesData } = localProfilesResponse;
    const allLocalProfiles = localProfilesData.map((profile: any): Data => ({
      userId: profile.userId as number,
      firstName: profile.firstName as string,
      lastName: profile.lastName as string,
      about: profile.about as string,
      height: profile.height as number,
      dob: new Date(profile.dob) as Date,
      username: profile.username as string,
      gender: profile.gender? profile.gender.toLowerCase(): undefined,
      genderPref: profile.genderPref? profile.genderPref.toLowerCase(): undefined,
      images: [],
      searchMiles: profile.searchMiles,
      location: {lat: profile.locationLat, lng: profile.locationLng} as GeoPoint,
      email: profile.email as string,
    })) as Data[];
    const localProfiles = allLocalProfiles.slice(0, 30);
    console.log(localProfiles);
    // for await (const localProfile of localProfiles) {
    //   const token = await postSignup(
    //     localProfile.username,
    //     "test",
    //     localProfile.dob.toString(),
    //     localProfile.firstName,
    //     localProfile.lastName,
    //     localProfile.email,
    //   );
    //   if (localProfile.location) {
    //     await postUserLocation(localProfile.location, token);
    //   }
    //   await postProfileInfo(
    //     token,
    //     localProfile.about? localProfile.about: "",
    //     localProfile.gender? localProfile.gender: "male",
    //     localProfile.genderPref? localProfile.genderPref: "female",
    //     localProfile.height? localProfile.height: 50,
    //     localProfile.searchMiles? localProfile.searchMiles: 500,
    //   );
    // }
  } catch (e) {
    console.log(e);
  }
}