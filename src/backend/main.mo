import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

// Mixins
actor {
  let accessControlState = AccessControl.initState();
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // Types
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
    imageUrls : [Storage.ExternalBlob];
    finishInfo : Text;
    isActive : Bool;
  };

  public type CustomizationRequest = {
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
    name : Text;
    email : Text;
    message : Text;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  // Storage
  let products = Map.empty<ProductId, Product>();
  var mangoWoodProducts = Map.empty<ProductId, Product>();
  var customizationRequests = List.empty<CustomizationRequest>();
  var contactFormSubmissions = List.empty<ContactFormSubmission>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Range constants
  let categoryRange = [
    "Tables",
    "Chairs",
    "Desks",
    "Cabinets",
    "Beds",
    "Sofas",
    "Chests",
    "Consoles",
    "Benches",
    "Lightning",
    "Shelves",
    "Decor",
    "Accessories",
    "Rugs",
    "Mirrors",
    "Antiques",
  ];

  let woodTypeRange = [
    #mangoWood,
    #acaciaWood,
    #lineRange,
    #customisedProducts,
  ];

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Products
  module Product {
    public func compareById(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.id, product2.id);
    };
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(productId : ProductId, updatedProduct : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    if (not products.containsKey(productId)) { Runtime.trap("Product not found") };
    products.add(productId, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    if (not products.containsKey(productId)) { Runtime.trap("Product not found") };
    products.remove(productId);
  };

  public query ({ caller }) func listProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all products");
    };
    products.values().toArray().sort(Product.compareById);
  };

  // Public query endpoints - accessible to everyone including guests
  public query func getProducts(category : ?Text) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.isActive and (category == null or (category != null and product.category == category.unwrap()))
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
      func(product) { product.isActive }
    );
  };

  // Mango Wood Products
  public query ({ caller }) func listMangoWoodProductsInternal() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all mango wood products");
    };
    mangoWoodProducts.values().toArray().sort(Product.compareById);
  };

  public query func getMangoWoodProductsInternal(category : ?Text) : async [Product] {
    mangoWoodProducts.values().toArray().filter(
      func(product) {
        product.isActive and (category == null or (category != null and product.category == category.unwrap()))
      }
    );
  };

  public query func getMangoWoodProductByIdInternal(productId : ProductId) : async Product {
    switch (mangoWoodProducts.get(productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  // Customization Requests
  public shared ({ caller }) func submitCustomizationRequest(request : CustomizationRequest) : async () {
    customizationRequests.add(request);
  };

  public query ({ caller }) func getCustomizationRequests() : async [CustomizationRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view customization requests");
    };
    customizationRequests.toArray();
  };

  // Contact Form
  public shared ({ caller }) func submitContactForm(submission : ContactFormSubmission) : async () {
    contactFormSubmissions.add(submission);
  };

  public query ({ caller }) func getContactFormSubmissions() : async [ContactFormSubmission] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view contact form submissions");
    };
    contactFormSubmissions.toArray();
  };
};
