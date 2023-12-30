const Banner = require('../models/bannerModel')

const loadBanner = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const banners = await Banner.find();
        const { message } = req.query
        const imageUrls = [] 
        if (banners) {
            for (const banner of banners){
                const imageUrl = `/product-images/${banner.image}`;
                imageUrls.push(imageUrl);
            }
        }   

        res.render('banner',{
            adminEmail,
            adminName,
            banners,
            imageUrls,
            message 
        })

    } catch (error) {
        console.log(error.message);
    }
}

const addBanner = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        res.render('add-banner',{
            adminEmail,
            adminName,
        })

    } catch (error) {
        console.log(error.message);
    }
}

const saveBanner = async(req,res)=>{
    try {
        const { title, description, url } = req.body
        const image = req.file.filename
        //console.log(req.file);

        console.log(image);

        const banner = new Banner({
            title: title,
            description: description,
            image: image,
            url: url
        })
        const bannerData = await banner.save()
        res.redirect('/banner/add')
        console.log(bannerData);
    } catch (error) {
        console.log(error.message);
    }
}

const editBanner = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const { id } = req.query
        const banner = await Banner.findById({_id: id})

        res.render('edit-banner',{
            adminEmail,
            adminName,
            banner
        })
        
    } catch (error) {
        console.log(error.message);
    }
}

const updateBanner = async (req, res) => {
    try {
        const { title, description, url, id } = req.body;
        console.log(req.body);

        let image;

        if (req.file && req.file.filename && req.file.filename.length > 0) {
            image = req.file.filename;
        } else {
            image = req.file; 
        }
        console.log("image",image);
        const banner = await Banner.findByIdAndUpdate(
            id,
            {
                title: title,
                description: description,
                image: image,
                url: url,
            },
            { new: true } 
        );

        res.redirect('/banner?message=Banner Updated')
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const blockBanner = async(req,res)=>{
    try {
        const { bannerId, isBlocked } = req.body;

        let val;
        if (isBlocked == 'false') { 
            val = true;
        } else {
            val = false
        }
        console.log(isBlocked);

        const banner = await Banner.findByIdAndUpdate(
            bannerId,
            { isBlocked: val }, 
            { new: true }
        );
        console.log(banner.isBlocked);

        res.status(200).json({  success:true, banner });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    loadBanner,
    addBanner,
    saveBanner,
    blockBanner,
    editBanner,
    updateBanner
}