const api = require('../app')
const Event = require('../models/Event')
const logger = require('pino')()
const monk = require('monk')

module.exports = api

api.get('/user/info', async (req, res) => {
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  res.json(req.user)
  await Event.insert({ name: 'userAuthenticated', createdAt: new Date(), user: { _id: req.user._id, username: req.user.username } }).catch(Function.prototype)
})
api.get('/user/logout', (req, res) => {
  req.logout()
  res.end()
})

if (process.env.NODE_ENV !== 'production') {
  api.get('/user/fake', (req, res) => {
    logger.info('req.user', req.user)
    const user = { '_id': monk.id('5cfffebcbac8a8391a8a5adc'), 'apikey': '605dda6d9b35d5e7e2d1b0b8ecc44986ecfba25b', 'id': '128166532', 'avatar': 'https://pbs.twimg.com/profile_images/1137706263155007490/eMMEytoA_normal.jpg', 'username': 'christian_fei', 'customer': { 'id': 'cus_FEjA8BGZkZzex1', 'object': 'customer', 'account_balance': 0, 'address': null, 'balance': 0, 'created': 1560281548, 'currency': null, 'default_source': 'card_1EkFhfHLHpGSODikBzsLMCaG', 'delinquent': false, 'description': null, 'discount': null, 'email': 'crifei93@gmail.com', 'invoice_prefix': '62E97F38', 'invoice_settings': { 'custom_fields': null, 'default_payment_method': null, 'footer': null }, 'livemode': false, 'metadata': { }, 'name': null, 'phone': null, 'preferred_locales': [ ], 'shipping': null, 'sources': { 'object': 'list', 'data': [ { 'id': 'card_1EkFhfHLHpGSODikBzsLMCaG', 'object': 'card', 'address_city': null, 'address_country': null, 'address_line1': null, 'address_line1_check': null, 'address_line2': null, 'address_state': null, 'address_zip': null, 'address_zip_check': null, 'brand': 'Visa', 'country': 'US', 'customer': 'cus_FEjA8BGZkZzex1', 'cvc_check': 'pass', 'dynamic_last4': null, 'exp_month': 4, 'exp_year': 2022, 'fingerprint': 'tOAxLl4vXbt4oE39', 'funding': 'credit', 'last4': '4242', 'metadata': { }, 'name': 'crifei93@gmail.com', 'tokenization_method': null } ], 'has_more': false, 'total_count': 1, 'url': '/v1/customers/cus_FEjA8BGZkZzex1/sources' }, 'subscriptions': { 'object': 'list', 'data': [ ], 'has_more': false, 'total_count': 0, 'url': '/v1/customers/cus_FEjA8BGZkZzex1/subscriptions' }, 'tax_exempt': 'none', 'tax_ids': { 'object': 'list', 'data': [ ], 'has_more': false, 'total_count': 0, 'url': '/v1/customers/cus_FEjA8BGZkZzex1/tax_ids' }, 'tax_info': null, 'tax_info_verification': null }, 'subscription': { 'id': 'sub_FEjAEmob4Xj50K', 'object': 'subscription', 'application_fee_percent': null, 'billing': 'charge_automatically', 'billing_cycle_anchor': 1560281549, 'billing_thresholds': null, 'cancel_at': null, 'cancel_at_period_end': false, 'canceled_at': null, 'collection_method': 'charge_automatically', 'created': 1560281549, 'current_period_end': 1562873549, 'current_period_start': 1560281549, 'customer': 'cus_FEjA8BGZkZzex1', 'days_until_due': null, 'default_payment_method': null, 'default_source': null, 'default_tax_rates': [ ], 'discount': null, 'ended_at': null, 'items': { 'object': 'list', 'data': [ { 'id': 'si_FEjAke0CVuG2M9', 'object': 'subscription_item', 'billing_thresholds': null, 'created': 1560281549, 'metadata': { }, 'plan': { 'id': 'pro', 'object': 'plan', 'active': true, 'aggregate_usage': null, 'amount': 100, 'billing_scheme': 'per_unit', 'created': 1559486458, 'currency': 'eur', 'interval': 'month', 'interval_count': 1, 'livemode': false, 'metadata': { }, 'nickname': 'Pro', 'product': 'prod_FBHQ8HGEui2XMQ', 'tiers': null, 'tiers_mode': null, 'transform_usage': null, 'trial_period_days': 14, 'usage_type': 'licensed' }, 'quantity': 1, 'subscription': 'sub_FEjAEmob4Xj50K', 'tax_rates': [ ] } ], 'has_more': false, 'total_count': 1, 'url': '/v1/subscription_items?subscription=sub_FEjAEmob4Xj50K' }, 'latest_invoice': 'in_1EkFhpHLHpGSODikOEYgvGgg', 'livemode': false, 'metadata': { }, 'plan': { 'id': 'pro', 'object': 'plan', 'active': true, 'aggregate_usage': null, 'amount': 100, 'billing_scheme': 'per_unit', 'created': 1559486458, 'currency': 'eur', 'interval': 'month', 'interval_count': 1, 'livemode': false, 'metadata': { }, 'nickname': 'Pro', 'product': 'prod_FBHQ8HGEui2XMQ', 'tiers': null, 'tiers_mode': null, 'transform_usage': null, 'trial_period_days': 14, 'usage_type': 'licensed' }, 'quantity': 1, 'schedule': null, 'start': 1560281549, 'start_date': 1560281549, 'status': 'active', 'tax_percent': null, 'trial_end': null, 'trial_start': null }, 'updatedAt': new Date('2019-06-11T19:32:31.441Z'), 'customerUpdatedAt': new Date('2019-06-11T19:32:31.441Z'), 'subscriptionUpdatedAt': new Date('2019-06-11T19:32:31.441Z') }
    req.user = user
    res.json(user)
  })
}
