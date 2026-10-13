


const processImages  =  (fields = [])  => {
    return  (req, res, next) => {
        if (!req.files && !req.file) return next();

        const extractUrl = (file) => file.path;

        fields.forEach(({ name, multiple }) => {
            if (!req.files?.[name]) return
            req.body[name] = multiple ? req.files[name].map(extractUrl) : extractUrl(req.files[name][0]);
        });
        if (req.file) {
            req.body[req.file.fieldname] = extractUrl(req.file);
        }
        next();
}}

module.exports = processImages