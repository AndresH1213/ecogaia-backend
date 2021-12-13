const { v4: uuidv4 } =  require('uuid');

exports.processImage = (file, type) => {
    
    const nameSplit = file.name.split('.');
    const extFile = nameSplit[nameSplit.length - 1];
    // validate extension
    const validExt = ['png','jpg','jpeg','gif','webp','JPG'];
    if (!validExt.includes(extFile)) {
        throw new Error('No se acepta ese formato de foto')
    }

    // Generate the file name
    const filename = `${uuidv4()}.${extFile}`;

    // Path to save the image
    const path = `./uploads/${type}/${filename}`;

    return [path, filename]
}