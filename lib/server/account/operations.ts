// Customer Account API operations, validated against the pinned schema by scripts/validate-graphql.mjs.
const ADDRESS_FIELDS = "id firstName lastName company address1 address2 city zoneCode zip countryCode phoneNumber formatted(withName: true, withCompany: true)";

export const CUSTOMER_OPERATIONS = {
  overview: `query AccountOverview {
    customer {
      firstName lastName displayName
      emailAddress { emailAddress }
      defaultAddress { ${ADDRESS_FIELDS} }
      orders(first: 3, reverse: true, sortKey: PROCESSED_AT) {
        nodes { id name processedAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } }
      }
    }
  }`,
  profile: `query AccountProfile { customer { firstName lastName emailAddress { emailAddress } } }`,
  updateProfile: `mutation AccountUpdateProfile($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) { customer { firstName lastName } userErrors { field message } }
  }`,
  addresses: `query AccountAddresses {
    customer {
      firstName lastName
      defaultAddress { id }
      addresses(first: 50) { nodes { ${ADDRESS_FIELDS} } }
    }
  }`,
  createAddress: `mutation AccountCreateAddress($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) { customerAddress { id } userErrors { field message } }
  }`,
  updateAddress: `mutation AccountUpdateAddress($addressId: ID!, $address: CustomerAddressInput, $defaultAddress: Boolean) {
    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) { customerAddress { id } userErrors { field message } }
  }`,
  deleteAddress: `mutation AccountDeleteAddress($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) { deletedAddressId userErrors { field message } }
  }`,
  orders: `query AccountOrders($first: Int, $last: Int, $after: String, $before: String) {
    customer {
      orders(first: $first, last: $last, after: $after, before: $before, reverse: true, sortKey: PROCESSED_AT) {
        nodes { id name processedAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } lineItemsSummary { lineItemCount } }
        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
      }
    }
  }`,
  order: `query AccountOrder($id: ID!) {
    order(id: $id) {
      id name processedAt financialStatus fulfillmentStatus statusPageUrl cancelledAt
      subtotal { amount currencyCode }
      totalShipping { amount currencyCode }
      totalTax { amount currencyCode }
      totalPrice { amount currencyCode }
      shippingAddress { formatted(withName: true, withCompany: true) }
      lineItems(first: 50) {
        nodes { id title variantTitle quantity sellingPlan { name } image { url altText } totalPrice { amount currencyCode } }
      }
      fulfillments(first: 10) {
        nodes { id status trackingInformation { company number url } }
      }
    }
  }`,
};
