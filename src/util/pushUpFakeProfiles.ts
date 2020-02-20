import Axios from "axios"
import { Profile } from "../models/Profile";
import { GeoPoint } from "../models/GeoPoint";
import { postSignup, postUserLocation, postProfileInfo } from "../data/dataApi";

const profiles = `/assets/data/profiles.json`;
const key = `476f9d30`;
const dataURL = `https://my.api.mockaroo.com/shorts_profiles.json?key=${key}`;

interface Data extends Profile{
  email: string,
}

export const fillProfiles = async () => {

  try {
    const localProfilesResponse = await Axios.request({
      url: dataURL,
      headers: {
        'Accept': 'application/json',
      },
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
    const localProfiles = allLocalProfiles.slice(0, 35);
    console.log(localProfiles);
    
    for (const localProfile of localProfiles) {
      const data = await postSignup(
        localProfile.username,
        "test",
        localProfile.dob.toISOString(),
        localProfile.firstName,
        localProfile.lastName,
        localProfile.email,
      );
      console.log(data);
      if (localProfile.location) {
        await postUserLocation(localProfile.location, data.token);
      }
      //await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedProfile = await postProfileInfo(
        data.token,
        localProfile.about? localProfile.about: "",
        localProfile.gender? localProfile.gender: "male",
        localProfile.genderPref? localProfile.genderPref: "female",
        localProfile.height? localProfile.height: 50,
        localProfile.searchMiles? localProfile.searchMiles: 500,
      );
      console.log(updatedProfile);
    }
  } catch (e) {
    console.log(e);
  }
}