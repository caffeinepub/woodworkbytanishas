import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ProductId = Text;
  type ImageId = Storage.ExternalBlob;

  public type WoodType = {
    #mangoWood;
    #acaciaWood;
    #lineRange;
    #customisedProducts;
  };

  public type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    woodType : WoodType;
    category : Text;
    imageUrls : [ImageId];
    finishInfo : Text;
    isActive : Bool;
    whatsappMessage : ?Text;
  };

  public type CustomizationRequest = {
    id : Text;
    name : Text;
    phone : Text;
    email : Text;
    productType : Text;
    woodType : WoodType;
    dimensions : Text;
    message : Text;
    referenceImageUrl : ?Storage.ExternalBlob;
    timestamp : Time.Time;
    status : Text;
  };

  public type ContactFormSubmission = {
    id : Text;
    name : Text;
    email : Text;
    message : Text;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  public type AnalyticsSummary = {
    totalProducts : Nat;
    activeProducts : Nat;
    inactiveProducts : Nat;
    productsByCategory : [(Text, [Product])];
    totalCustomizationRequests : Nat;
    totalContactSubmissions : Nat;
    recentCustomizationRequests : [CustomizationRequest];
    recentContactSubmissions : [ContactFormSubmission];
  };

  public type PaginatedProducts = {
    products : [Product];
    total : Nat;
  };

  var products = Map.empty<ProductId, Product>();
  var customizationRequests = List.empty<CustomizationRequest>();
  var contactFormSubmissions = List.empty<ContactFormSubmission>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module Product {
    public func compareById(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.id, product2.id);
    };
  };

  // ── User profile management ─────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Analytics ──────────────────────────────────────────────────────────────

  public query ({ caller }) func getAnalyticsSummary() : async AnalyticsSummary {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    let allProducts = products.values().toArray();
    {
      totalProducts = allProducts.size();
      activeProducts = allProducts.filter(func(p : Product) : Bool { p.isActive }).size();
      inactiveProducts = allProducts.filter(func(p : Product) : Bool { not p.isActive }).size();
      productsByCategory = computeProductsGroupedByCategory();
      totalCustomizationRequests = customizationRequests.size();
      totalContactSubmissions = contactFormSubmissions.size();
      recentCustomizationRequests = computeMostRecentCustomizationRequests(5);
      recentContactSubmissions = computeMostRecentContactFormSubmissions(5);
    };
  };

  func computeProductsGroupedByCategory() : [(Text, [Product])] {
    let groupedMap = Map.empty<Text, [Product]>();
    for (product in products.values()) {
      let existing = switch (groupedMap.get(product.category)) {
        case (null) { [] };
        case (?ps) { ps };
      };
      groupedMap.add(product.category, existing.concat([product]));
    };
    groupedMap.toArray();
  };

  func computeMostRecentCustomizationRequests(limit : Nat) : [CustomizationRequest] {
    let allRequests = customizationRequests.toArray();
    let sortedRequests = allRequests.sort(
      func(a : CustomizationRequest, b : CustomizationRequest) : Order.Order {
        if (a.timestamp > b.timestamp) { #less } else if (a.timestamp == b.timestamp) { #equal } else {
          #greater;
        };
      }
    );
    let sortedSize = sortedRequests.size();
    if (sortedSize <= limit) {
      sortedRequests;
    } else {
      Array.tabulate<CustomizationRequest>(limit, func(i) { sortedRequests[i] });
    };
  };

  func computeMostRecentContactFormSubmissions(limit : Nat) : [ContactFormSubmission] {
    let allSubmissions = contactFormSubmissions.toArray();
    let sortedSubmissions = allSubmissions.sort(
      func(a : ContactFormSubmission, b : ContactFormSubmission) : Order.Order {
        if (a.timestamp > b.timestamp) { #less } else if (a.timestamp == b.timestamp) { #equal } else {
          #greater;
        };
      }
    );
    let sortedSize = sortedSubmissions.size();
    if (sortedSize <= limit) {
      sortedSubmissions;
    } else {
      Array.tabulate<ContactFormSubmission>(limit, func(i) { sortedSubmissions[i] });
    };
  };

  public query ({ caller }) func getProductsGroupedByCategory() : async [(Text, [Product])] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view products grouped by category");
    };
    computeProductsGroupedByCategory();
  };

  public query ({ caller }) func getMostRecentCustomizationRequests(limit : Nat) : async [CustomizationRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view customization requests");
    };
    computeMostRecentCustomizationRequests(limit);
  };

  public query ({ caller }) func getMostRecentContactFormSubmissions(limit : Nat) : async [ContactFormSubmission] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view contact form submissions");
    };
    computeMostRecentContactFormSubmissions(limit);
  };

  // ── Product management (admin-only) ─────────────────────────────────────────

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    if (not products.containsKey(product.id)) {
      products.add(product.id, product);
    };
  };

  public shared ({ caller }) func updateProduct(productId : ProductId, updatedProduct : Product) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("UpdateProduct: Product not found") };
      case (?_) { products.add(productId, updatedProduct) };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    if (products.containsKey(productId)) {
      products.remove(productId);
    } else {
      Runtime.trap("DeleteProduct: Product not found");
    };
  };

  public query func listProducts(offset : Nat, limit : Nat) : async PaginatedProducts {
    let sortedArray = products.values().toArray().sort(Product.compareById);
    let totalProducts = sortedArray.size();

    let defaultLimit = 10;
    let safeOffset = if (offset > totalProducts) { totalProducts } else { offset };
    let safeLimit = if (limit > 0) { limit } else { defaultLimit };

    let endIndex = if (safeOffset + safeLimit > totalProducts) {
      totalProducts;
    } else { safeOffset + safeLimit };

    let productsArray = if (totalProducts > 0 and endIndex > safeOffset) {
      Array.tabulate(
        endIndex - safeOffset,
        func(i) {
          sortedArray[safeOffset + i];
        },
      );
    } else {
      [];
    };
    {
      products = productsArray;
      total = totalProducts;
    };
  };

  // ── Public product queries (no auth required) ───────────────────────────────

  public query func getProducts(category : ?Text) : async [Product] {
    products.values().toArray().filter(
      func(product : Product) : Bool {
        product.isActive and (
          switch (category) {
            case (null) { true };
            case (?cat) { product.category == cat };
          }
        );
      }
    );
  };

  public query func getProductById(productId : ProductId) : async Product {
    switch (products.get(productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(
      func(product : Product) : Bool { product.isActive }
    );
  };

  // ── Public form submissions (no auth required) ──────────────────────────────

  public shared func submitCustomizationRequest(request : CustomizationRequest) : async () {
    customizationRequests.add(request);
  };

  public shared func submitContactForm(submission : ContactFormSubmission) : async Text {
    contactFormSubmissions.add(submission);

    let whatsappNumber = "919828288383";
    let timestampText = submission.timestamp.toText();

    let messageText = "Contact%20Form%20Submission%0AName%3A%20"
      # submission.name
      # "%0AEmail%3A%20"
      # submission.email
      # "%0AMessage%3A%20"
      # submission.message
      # "%0ATimestamp%3A%20"
      # timestampText;

    let whatsappUrl = "https://wa.me/" # whatsappNumber # "?text=" # messageText;
    whatsappUrl;
  };
};
