import firebase from 'firebase'
import 'firebase/firestore'

export default async ({ Vue }) => {
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: 'AIzaSyA4Rmpkx0dFfQ281NGFFJNh95wQbIFxgFE',
    authDomain: 'project-mastery.firebaseapp.com',
    databaseURL: 'https://project-mastery.firebaseio.com',
    projectId: 'project-mastery',
    storageBucket: 'project-mastery.appspot.com',
    messagingSenderId: '279613197143',
    appId: '1:279613197143:web:623bb76f74d75d9d'
  }
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)

  Vue.prototype.$firestore = firebase.firestore()
  Vue.prototype.$storage = firebase.storage()
  Vue.prototype.$storageRef = firebase.storage().ref()
}
