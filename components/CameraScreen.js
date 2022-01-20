import React, { useState, useEffect } from "react";
import { Button, Image, View, StyleSheet, Text, Modal, ToastAndroid, Pressable,TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import { Accelerometer } from "expo-sensors";

export default function CameraScreen({navigation}) {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState(null);
  const [text, setText] = useState(null);
  const [type, setType] = useState(null);
  const [folder, setFolder] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userGivenFolderName,setUserGivenFolderName]=useState(null);
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [material, setMaterial] = useState("PPT");

  const toDegrees = (rad) => (rad * 180) / Math.PI;

  let getMaterial = () => {
    Accelerometer.addListener((accelerometerData) => {
      setData(accelerometerData);
    });

    let x = data.x,
      y = data.y,
      z = data.z;
    let normalizedVal = Math.sqrt(x * x + y * y + z * z);

    // Normalize the accelerometer vector
    
    z = z / normalizedVal;

    //Inclination
    let inclination = Math.round(toDegrees(Math.acos(z)));

    if (inclination < 50 || inclination > 130) {
      setMaterial("Paper");
      // ToastAndroid.show("Capturing Paper", ToastAndroid.SHORT);
    } else {
      setMaterial("PPT");
      // ToastAndroid.show("Capturing PPT", ToastAndroid.SHORT);
    }
  };

  useEffect(async () => {
    console.log(await FileSystem.readDirectoryAsync(FileSystem.documentDirectory));
  }, [])

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.cancelled) {
      setImageFile(result);
      setImage(result.uri);
      setName("image.jpg");
      setType(result.type);
    }
  };

  const takeImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      quality: 0.5
    });

    if (!result.cancelled) {
      setImageFile(result);
      setImage(result.uri);
      setName("image.jpg");
      setType(result.type);
    }
  };


  useEffect(async () => {
    if (image) {
      getMaterial();
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      let locationBasedDirectory = String("Loc_" + location.coords.latitude.toFixed(4)) + "_" + String(location.coords.longitude.toFixed(4));
      let folders=await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      let flag=false;
      let folder_path=null;
      for(let folder in folders){
        if(folders[folder].includes(locationBasedDirectory)){
          flag=true;
          folder_path=FileSystem.documentDirectory +folders[folder];
        }
      }
      
      if(flag===false){
        setModalVisible(!modalVisible);
      }
      else{
         await FileSystem.copyAsync({ from: image, to: folder_path + "/file_" + Date.now() + '_'+ material + ".jpg" });
        console.log(await FileSystem.readDirectoryAsync(folder_path));
        console.log();
        ToastAndroid.show(`Saved to ${folder_path.split('/')[folder_path.split('/').length-1].split('_')[0]}`, ToastAndroid.LONG);
      }
    }
  }, [image]);

  const setFolderName=async ()=>{
    let location = await Location.getCurrentPositionAsync({});
    let locationBasedDirectory = String("Loc_" + location.coords.latitude.toFixed(4)) + "_" + String(location.coords.longitude.toFixed(4));
    let folder_path = FileSystem.documentDirectory + userGivenFolderName + '_' + locationBasedDirectory
      try {
        let folder = await FileSystem.makeDirectoryAsync(folder_path);
        setFolder(folder);
      }
      catch {
        console.log('Folder Already exists');
        setFolder(folder_path);
      }
      console.log("folder value is 2: " + folder);
      await FileSystem.copyAsync({ from: image, to: folder_path + "/file_" + Date.now() +'_'+material + ".jpg" });
      console.log(await FileSystem.readDirectoryAsync(folder_path));
  }

  return (
    <View style={styles.CSStyle}>
      <View style={styles.buttonView}>
        <Button
        color={'#202020'}
          title="Go to Documents"
          onPress={() => navigation.navigate('Documents Screen')}
        />
      </View>
      <View style={styles.buttonView}>
        <Button
        color={'#202020'}
          title="Pick an image from Gallery"
          onPress={pickImage}
        />
      </View>
      <View style={styles.buttonView}>
        <Button
        color={'#202020'}
          title="Click a Picture"
          onPress={takeImage}
        />
      </View>
      <Text>Captured Image:</Text>
      {image? <Image source={{ uri: image }} style={styles.image} />:
       <Image style={styles.image1} source={require('../assets/CameraIcon.png')}/>}
      {
        modalVisible?
        <View style={styles.centeredView}>
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Give a folder name</Text>
            <TextInput
              style={styles.input}
              onChangeText={(folderName) => setUserGivenFolderName(folderName)}
              value={userGivenFolderName}
              placeholder="Enter folder name here"
              keyboardType="default"
            />
            <Pressable
              style={[styles.buttons, styles.buttonClose]}
              onPress={() => {
                  setFolderName();
                  setModalVisible(!modalVisible);
                  ToastAndroid.show(`Saved to ${userGivenFolderName}`, ToastAndroid.SHORT);
                }
              }
            >
              <Text style={styles.textStyle}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      </View>:
      <View/>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  CSStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:'rgba(40,40,40,0.6)'
  },
  buttonView: {
    margin: 10
  },
  image: {
    width: 220,
    height: 380,
  },
  image1: {
    marginTop:50,
    width: 150,
    height: 150,
  },
  download: {
    flexDirection: "row",
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: 'black',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
