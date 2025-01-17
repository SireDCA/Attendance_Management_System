const cloudinary = require('./cloudinary');
const fs = require('fs');
const multer = require('multer');
const { v4 } = require('uuid')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        const fileName = file.originalname.toLowerCase().split(' ').join('-')
        cb(null, v4() + '-' + fileName)
    }
})

// var upload = multer({storage: storage});
var upload = multer({
    storage: storage,
    // limits: {fileSize: 10485760}, //10mb (10 * 1024 * 1024)
    // fileFilter: (req, file, cb) => {
    //     if( file.size > 10485760) {
    //         cb(null, false);
    //         return cb(new Error("Image should not be more than 10mb"))
    //     }
    //     else {
    //         cb(null, true)
    //     }
    // }

});

async function uploadStudentPicToCloudinary(localFilePath) {

    console.log(localFilePath);
    // filePathOnCloudinary:
    //path of image we want when it is uploaded to cloudinary
    return cloudinary.uploader.upload(localFilePath, { folder: 'main' })
        .then((result) => {
            //Image has been successfully uploaded on cloudinary so we dont need local image file anymore
            // Remove file from local uploads folder
            fs.unlinkSync(localFilePath)

            return {
                message: "Success, Profile Picture uploaded",
                url: result.secure_url,
                details: result,
                publicId: result.public_id

            };
        })
        .catch((error) => {
            //Remove file from local uploads or api/uploads folder
            fs.unlinkSync(localFilePath)
            console.log(error);
            return { message: "Fail", error: error };
        });
}

async function deleteFromCloudinary(publicId) {
    let delImage = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted image", delImage);
    return delImage;
}

async function updateProfilePicture(publicId, localFilePath) {
    return await deleteFromCloudinary(publicId)
     .then(async () => {
         let result = await uploadProfilePicToCloudinary(localFilePath) ;
         // console.log("Updated image ", result);
         if(result.message !== "Fail") {
             return {
                 message: "Profile Picture updated successfully",
                 url: result.url,
                 publicId: result.publicId,
                 details: result.details
             }
         } else {
             return {
                 message: "Failed to update image.",
                 error: result.error
             }
         }
     })
 
 }


module.exports = {
    upload,
    uploadStudentPicToCloudinary

}