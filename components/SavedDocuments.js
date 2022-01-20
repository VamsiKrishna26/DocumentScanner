import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, FlatList, Button, ToastAndroid, Image, TouchableOpacity } from "react-native";
// import NavBar from "./NavBar";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { Asset } from "expo-asset";
import { manipulateAsync } from "expo-image-manipulator";
import { shareAsync } from "expo-sharing";
import { StorageAccessFramework } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

export default function SavedDocuments() {
  const [selectedSortCondition, setSelectedSortCondition] = useState();
  const [folders, setFolders] = useState(null);
  const [firstImages, setFirstImages] = useState(null);


  useEffect(async () => {
    let folders=(await FileSystem.readDirectoryAsync(FileSystem.documentDirectory));
    let index = folders.indexOf('rList');
    if (index > -1) {
      folders.splice(index, 1);
    }
    index = folders.indexOf('.expo-internal');
    if (index > -1) {
      folders.splice(index, 1);
    }
    setFolders(folders);
  }, [])

  const pdfGenerate = async (folder) => {
    ToastAndroid.show('Generating PDF. Please wait!!', ToastAndroid.LONG);
    let images = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + '/' + folder);
    let images_list = [];
    let image_paths_list = [];
    let fileNames = [];
    for (let image in images) {
      let image_path = (FileSystem.documentDirectory + '/' + folder + '/' + images[image]);
      const asset = Asset.fromModule(image_path);
      const image1 = await manipulateAsync(asset.localUri ?? asset.uri, [], {
        base64: true,
      });
      images_list.push(image1);
      image_paths_list.push(image_path);
      fileNames.push(images[image]);
    }

    let html_string = '';
    for (let i in images_list) {
      let upload = async () =>
        FileSystem.uploadAsync("http://mubi-back-end.herokuapp.com/", image_paths_list[i], {
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "Image",
          mimeType: "image/jpeg",
        });

      let response = await upload();
      let text = (response.body);
      html_string += `<img src="data:image/jpeg;base64,${images_list[i].base64}" style="width: 500;height: 800"/>
      <p><b>Document type:</b> ${fileNames[i].split('_')[2].split('.')[0]}</p>
      <p>${text}</P>`
    }
    console.log('done')
    const html = `
    <html>
      <head>
      </head>
      <body style="margin:auto">
        <h1>${folder.split('_')[0]}</h1>
        ${html_string}
      </body>
    </html>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    console.log("URI is:" + uri);
    return uri;
  }

  const writePDF = async (folder) => {
    const uri = await pdfGenerate(folder);
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    console.log('PDF', folder);
    let fileName = folder.split('_')[0]
    if (permissions.granted) {
      // Gets SAF URI from response
      const folder = permissions.directoryUri;
      const newFile = await FileSystem.StorageAccessFramework.createFileAsync(
        folder,
        `${fileName}`,
        "application/pdf"
      );
      let value = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await FileSystem.StorageAccessFramework.writeAsStringAsync(newFile, value, {
        encoding: FileSystem.EncodingType.Base64,
      });
      IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: newFile,
        flags: 1,
        type: 'application/pdf'
      });
      ToastAndroid.show('Generated. Please check your folder!!', ToastAndroid.LONG);
    }

  };

  const sharePDF = async (folder) => {
    const uri = await pdfGenerate(folder);
    ToastAndroid.show('Generated. Please share!!', ToastAndroid.LONG);
    await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  }

  const writeDoc = (folder) => {
    return
  }

  const delPDF=async (folder)=>{
    await FileSystem.deleteAsync(FileSystem.documentDirectory + '/' + folder);
    ToastAndroid.show('Folder Deleted!', ToastAndroid.LONG);
    let index=folders.indexOf(folder);
    let folders1=[...folders]
    if (index > -1) {
      folders1.splice(index, 1);
    }
    console.log(folders1);
    setFolders(folders1);
  }


  useEffect(async () => {
    let list1 = []
    for (let folder in folders) {
      try{
        let images = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + '/' + folders[folder]);
        let image_path = (FileSystem.documentDirectory + '/' + folders[folder] + '/' + images[0]);
        const asset = Asset.fromModule(image_path);
        const image1 = await manipulateAsync(asset.localUri ?? asset.uri, [], {
          base64: true,
        });
        list1.push("data:image/jpeg;base64," + image1.base64);
        }
      catch{
        
      }
    }
    setFirstImages(list1);
  }, [folders]);



  return (
    <View style={styles.screen}>
      <StatusBar hidden={true} />
      <View style={styles.body}>
        <View style={styles.sort_menu}>
          <Text style={styles.sort_menu_text}>Sort By:</Text>
          <Picker
            style={styles.sort_menu_dropdown}
            selectedValue={selectedSortCondition}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedSortCondition(itemValue)
            }
          >
            <Picker.Item label="Location" value="location" />
            <Picker.Item label="Date" value="date" />
          </Picker>
        </View>
        <View style={styles.folders}>
          {folders && folders.length > 0 ? <FlatList
            keyExtractor={(item) => item}
            data={folders}
            renderItem={({ item, index }) => (
              <View style={styles.flat_list_item}>
                {firstImages ? <Image style={styles.photo} source={{ uri: firstImages[index] }} /> : <Text>none</Text>}
                <View style={styles.flat_list_item_1}>
                  <View style={styles.text_and_del}>
                    <Text style={styles.item}>{item.split('_')[0]}</Text>
                    <TouchableOpacity style={styles.item2} onPress={() => delPDF(item)}>
                      <Image style={styles.del} source={require('../assets/Delete.png')} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.flat_list_item_2}>
                    <View style={styles.pdf_button}>
                      <Button title="PDF" onPress={() => writePDF(item)} color={'black'} />
                    </View>
                    <View style={styles.buttons}>
                      <Button title="DOC" onPress={() => writeDoc(item)} color={'black'} />
                    </View>
                    <View>
                      <TouchableOpacity onPress={() => sharePDF(item)}>
                        <Image style={styles.share} source={require('../assets/ShareIcon.png')} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
          /> : 
          <Text style={styles.nofolders}>No Folders</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "rgba(40,40,40,0.6)",
  },
  body: {
    flex: 9.3,
    width: "100%",
  },
  sort_menu: {
    flex: 0.7,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(20,20,20,0.6)'
  },

  flat_list_item: {
    borderTopWidth: 1,
    borderColor: 'black',
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    height: 150
  },
  nofolders:{
    textAlign:'center',
    color: 'white',
    fontSize: 20
  },
  sort_menu_text: {
    flex: 2,
    marginLeft: 10,
    fontSize: 16,
    textAlign: "right",
    color: 'white',
  },
  sort_menu_dropdown: {
    flex: 9,
    marginRight: 10,
    color: 'white',
  },
  sort_menu_background: {
    backgroundColor: "rgba(40,40,40,0.6)"
  },
  folders: {
    flex: 9.3,
    borderWidth: 1,
    borderColor: "black",
    justifyContent:'center'
  },
  text_and_del:{
    flexDirection: 'row'
  },
  item: {
    flex: 8.5,
    // marginHorizontal: 10,
    fontSize: 24,
    color: 'white',
    // borderColor: 'red',
    // borderWidth: 2,
    textAlignVertical: 'center'
  },
  item2:{
    flex: 1.5,
    // borderColor: 'blue',
    // borderWidth: 2,
    // alignSelf: 'verical'
    // textAlignVertical: 'center'

  },
  flat_list_item_2: {
    flex: 2.5,
    // borderColor: 'blue',
    // borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttons: {
    flex: 1.5,
    margin: 10,
    marginBottom: 30
  },
  pdf_button: {
    flex: 1.5,
    margin: 10,
    marginBottom: 30,
    marginLeft: 0

  },
  share: {
    width: 20,
    height: 20,
    margin: 10,
    marginBottom: 30
  },
  del:{
    width: 20,
    height: 20,
    margin: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  photo: {
    flex: 1,
    width: 90,
    height: 130,
    margin: 10
  },
  flat_list_item_1: {
    flex: 3
  }
});
