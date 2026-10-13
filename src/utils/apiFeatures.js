

class apiFeatures {
    constructor(queryString, mongooseQuery){
        this.queryString = queryString
        this.mongooseQuery = mongooseQuery
    }
    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.mongooseQuery = this.mongooseQuery.sort(sortBy)
        } else {
            this.mongooseQuery = this.mongooseQuery.sort('-createdAt')
        }
        return this
    }
    filter(){
        const queryObj = {...this.queryString}
        const excludeFields = ['sort', 'page', 'limit', 'keywords', 'fields']
        excludeFields.forEach(el => delete queryObj[el])
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr))
        return this
    }
    paginate(){
        const page = +this.queryString.page || 1
        const limit = +this.queryString.limit || 10
        const skip = (page - 1) * limit
        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit)
        return this
    }
    limitFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ')
            this.mongooseQuery = this.mongooseQuery.select(fields)
        } else {
            this.mongooseQuery = this.mongooseQuery.select('-__v')
        }
        return this
    }
    search(){
        if(this.queryString.keywords){
            const keywords = this.queryString.keywords
            this.mongooseQuery.find({name:{$regex:keywords, $options : 'i'}})
            return this
        } else {
            this.mongooseQuery.find()
        }
        return this
    }
}


module.exports = apiFeatures