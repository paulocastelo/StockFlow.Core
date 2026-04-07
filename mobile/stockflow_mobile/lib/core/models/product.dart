class Product {
  final String id;
  final String categoryId;
  final String name;
  final String sku;
  final double unitPrice;
  final bool isActive;

  Product({
    required this.id,
    required this.categoryId,
    required this.name,
    required this.sku,
    required this.unitPrice,
    required this.isActive,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] as String,
        categoryId: json['categoryId'] as String,
        name: json['name'] as String,
        sku: json['sku'] as String,
        unitPrice: (json['unitPrice'] as num).toDouble(),
        isActive: json['isActive'] as bool,
      );
}
