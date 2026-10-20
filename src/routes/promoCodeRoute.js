const router = require('express').Router()

const {
    createPromoCode,
    getAllPromoCodes,
    getPromoCodeById,
    updatePromoCode,
    deletePromoCode,
    togglePromoCode,
    validatePromoCode,
} = require('../controllers/promoCodeController')

const {
    createPromoCodeValidator,
    updatePromoCodeValidator,
    promoCodeIdValidator,
    validatePromoCodeValidator,
} = require('../validators/promoCodeValidator')

const { allowedTo } = require('../middlewares/verifyToken')

// ==========================================
// VALIDATE PROMO CODE - USER
// IMPORTANT: Must be before /:id
// ==========================================

router.route('/validate')
    .post(
        allowedTo('user'),
        validatePromoCodeValidator,
        validatePromoCode
    )

// ==========================================
// ADMIN - CREATE / GET ALL
// ==========================================

router.route('/')
    .post(
        allowedTo('admin'),
        createPromoCodeValidator,
        createPromoCode
    )
    .get(
        allowedTo('admin'),
        getAllPromoCodes
    )

// ==========================================
// ADMIN - GET / UPDATE / DELETE
// ==========================================

router.route('/:id')
    .get(
        allowedTo('admin'),
        promoCodeIdValidator,
        getPromoCodeById
    )
    .put(
        allowedTo('admin'),
        promoCodeIdValidator,
        updatePromoCodeValidator,
        updatePromoCode
    )
    .delete(
        allowedTo('admin'),
        promoCodeIdValidator,
        deletePromoCode
    )

// ==========================================
// ADMIN - TOGGLE
// ==========================================

router.route('/:id/toggle')
    .put(
        allowedTo('admin'),
        promoCodeIdValidator,
        togglePromoCode
    )

module.exports = router