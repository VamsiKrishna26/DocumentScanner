import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
export default function Navbar() {

    const [openMenu, setOpenMenu] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.mainheading}>
                <Text style={styles.heading}>Document Scanner</Text>
                <TouchableOpacity style={styles.head2} onPress={() => setOpenMenu(!openMenu)}>
                    <Image style={styles.image1} source={require('../assets/Question.svg.png')} />
                </TouchableOpacity>
            </View>
            {
                openMenu ?
                    <View style={styles.centeredView}>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={openMenu}
                            onRequestClose={() => {
                                setOpenMenu(!openMenu);
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalText}>About {"\n"}</Text>
                                    <Text style={styles.modalText1}>
                                        Document Scanner is a smart scanner app which lets you capture and store any image with text on it and also extract the text present in the image as a paragraph, which can be copied and used anywhere. The unique feature of the app is that the images captured at the same location can be gathered together and saved in one document in PDF or DOCX format.{"\n"}
                                    </Text>
                                    <Text style={styles.modalText1}>
                                        Features:{"\n"}
                                        The app also supports below useful features.{"\n"}
                                        1.	Allows you to choose an image from the device or capture an image on the spot.{"\n"}
                                        2.	Allows you to enter a chosen folder name when an image is captured for the first time in a new location.{"\n"}
                                        3.	Allows you to generate the PDF or DOCX file anytime with just one click.{"\n"}
                                        4.	Allows you to share the PDF or DOCX file with others.{"\n"}
                                        5.	Automatic saving of images in their respective location-based folders.{"\n"}
                                        6.	Automatic tagging of the image type i.e. as PPT or Document.{"\n"}
                                    </Text>
                                    <Text style={styles.modalText1}>
                                        App Developed By:{"\n"}
                                        1. Vamsi Krishna Palaparti{"\n"}
                                        2. Vasanth Tulasi{"\n"}
                                        {"\n"}
                                        Supported By:{"\n"}
                                        1. Kunle Adeyemo {"\n"}

                                    </Text>
                                    <Pressable
                                        style={styles.closeButton}
                                        onPress={() => {
                                            setOpenMenu(!openMenu);
                                        }
                                        }
                                    >
                                        <Text style={styles.buttonText}>Close</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </Modal>

                    </View> :
                    <View />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    mainheading: {
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'space-between'
    },
    heading: {
        flex: 8,
        fontSize: 30,
        color: 'white',
        // marginLeft: 20
        // borderWidth: 2,
        // borderColor: 'red',
        textAlign: 'center'
    },
    head2 :{
        flex: 2,
        fontSize: 30,
        color: 'white',
        // marginLeft: 20
        // borderWidth: 2,
        // borderColor: 'blue'
    },
    image1: {
        width: 40,
        height: 40,
        right: 0,
        // borderWidth: 2,
        // borderColor: 'red',
        alignSelf: 'flex-end'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'black',
        borderRadius: 20,
        padding: 35,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center'
    },
    modalText1: {
        color: 'white',
        fontSize: 15
    },
    closeButton: {
        backgroundColor: 'white',
        margin: 10,
        alignSelf: 'center'
    },
    buttonText: {
        fontSize: 18
    }
});
