using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Inflame_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessTablesAndConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "analytics_logs",
                columns: table => new
                {
                    log_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    details = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_analytics_logs", x => x.log_id);
                });

            migrationBuilder.CreateTable(
                name: "client",
                columns: table => new
                {
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    physical_address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client", x => x.client_id);
                });

            migrationBuilder.CreateTable(
                name: "custom_braai_option",
                columns: table => new
                {
                    custom_option_id = table.Column<Guid>(type: "uuid", nullable: false),
                    option_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    material = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    style_option = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    width_mm = table.Column<int>(type: "integer", nullable: false),
                    height_mm = table.Column<int>(type: "integer", nullable: false),
                    depth_mm = table.Column<int>(type: "integer", nullable: false),
                    intel_mm = table.Column<int>(type: "integer", nullable: false),
                    additional_message = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_custom_braai_option", x => x.custom_option_id);
                });

            migrationBuilder.CreateTable(
                name: "product",
                columns: table => new
                {
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    product_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    brand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    is_imported = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_customisable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    on_special = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    is_visible = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product", x => x.product_id);
                });

            migrationBuilder.CreateTable(
                name: "staff_account",
                columns: table => new
                {
                    staff_id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    identity_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    profile_image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    receive_quote_emails = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_staff_account", x => x.staff_id);
                });

            migrationBuilder.CreateTable(
                name: "StaffTrustedDevices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeviceName = table.Column<string>(type: "text", nullable: false),
                    IpAddress = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastUsedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffTrustedDevices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StaffTrustedDevices_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "custom_braai_part",
                columns: table => new
                {
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    custom_option_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_custom_braai_part", x => x.part_id);
                    table.ForeignKey(
                        name: "FK_custom_braai_part_custom_braai_option_custom_option_id",
                        column: x => x.custom_option_id,
                        principalTable: "custom_braai_option",
                        principalColumn: "custom_option_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "custom_fireplace_part",
                columns: table => new
                {
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    custom_option_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_custom_fireplace_part", x => x.part_id);
                    table.ForeignKey(
                        name: "FK_custom_fireplace_part_custom_braai_option_custom_option_id",
                        column: x => x.custom_option_id,
                        principalTable: "custom_braai_option",
                        principalColumn: "custom_option_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "braai_product",
                columns: table => new
                {
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    fuel_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    braai_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_braai_product", x => x.product_id);
                    table.ForeignKey(
                        name: "FK_braai_product_product_product_id",
                        column: x => x.product_id,
                        principalTable: "product",
                        principalColumn: "product_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "enquiry",
                columns: table => new
                {
                    enquiry_id = table.Column<Guid>(type: "uuid", nullable: false),
                    enquiry_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: true),
                    custom_option_id = table.Column<Guid>(type: "uuid", nullable: true),
                    message = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "New"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    client_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enquiry", x => x.enquiry_id);
                    table.ForeignKey(
                        name: "FK_enquiry_client_client_id",
                        column: x => x.client_id,
                        principalTable: "client",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_enquiry_custom_braai_option_custom_option_id",
                        column: x => x.custom_option_id,
                        principalTable: "custom_braai_option",
                        principalColumn: "custom_option_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_enquiry_product_product_id",
                        column: x => x.product_id,
                        principalTable: "product",
                        principalColumn: "product_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "fireplace_product",
                columns: table => new
                {
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    heat_output_kw = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    fireplace_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fireplace_product", x => x.product_id);
                    table.ForeignKey(
                        name: "FK_fireplace_product_product_product_id",
                        column: x => x.product_id,
                        principalTable: "product",
                        principalColumn: "product_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "product_image",
                columns: table => new
                {
                    image_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_image", x => x.image_id);
                    table.ForeignKey(
                        name: "FK_product_image_product_product_id",
                        column: x => x.product_id,
                        principalTable: "product",
                        principalColumn: "product_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gallery_photo",
                columns: table => new
                {
                    photo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    uploaded_by = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gallery_photo", x => x.photo_id);
                    table.ForeignKey(
                        name: "FK_gallery_photo_staff_account_uploaded_by",
                        column: x => x.uploaded_by,
                        principalTable: "staff_account",
                        principalColumn: "staff_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "internal_note",
                columns: table => new
                {
                    note_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    staff_account_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_internal_note", x => x.note_id);
                    table.ForeignKey(
                        name: "FK_internal_note_client_client_id",
                        column: x => x.client_id,
                        principalTable: "client",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_internal_note_staff_account_staff_account_id",
                        column: x => x.staff_account_id,
                        principalTable: "staff_account",
                        principalColumn: "staff_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "invoice_record",
                columns: table => new
                {
                    invoice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    staff_account_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invoice_record", x => x.invoice_id);
                    table.ForeignKey(
                        name: "FK_invoice_record_client_client_id",
                        column: x => x.client_id,
                        principalTable: "client",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_invoice_record_staff_account_staff_account_id",
                        column: x => x.staff_account_id,
                        principalTable: "staff_account",
                        principalColumn: "staff_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_client_email",
                table: "client",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "IX_custom_braai_part_custom_option_id",
                table: "custom_braai_part",
                column: "custom_option_id");

            migrationBuilder.CreateIndex(
                name: "IX_custom_fireplace_part_custom_option_id",
                table: "custom_fireplace_part",
                column: "custom_option_id");

            migrationBuilder.CreateIndex(
                name: "IX_enquiry_client_id",
                table: "enquiry",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_enquiry_custom_option_id",
                table: "enquiry",
                column: "custom_option_id");

            migrationBuilder.CreateIndex(
                name: "IX_enquiry_product_id",
                table: "enquiry",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_gallery_photo_uploaded_by",
                table: "gallery_photo",
                column: "uploaded_by");

            migrationBuilder.CreateIndex(
                name: "IX_internal_note_client_id",
                table: "internal_note",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_internal_note_staff_account_id",
                table: "internal_note",
                column: "staff_account_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoice_record_client_id",
                table: "invoice_record",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoice_record_staff_account_id",
                table: "invoice_record",
                column: "staff_account_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_category",
                table: "product",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "IX_product_product_type",
                table: "product",
                column: "product_type");

            migrationBuilder.CreateIndex(
                name: "IX_product_image_product_id",
                table: "product_image",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_account_email",
                table: "staff_account",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_staff_account_identity_user_id",
                table: "staff_account",
                column: "identity_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_StaffTrustedDevices_UserId",
                table: "StaffTrustedDevices",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "analytics_logs");

            migrationBuilder.DropTable(
                name: "braai_product");

            migrationBuilder.DropTable(
                name: "custom_braai_part");

            migrationBuilder.DropTable(
                name: "custom_fireplace_part");

            migrationBuilder.DropTable(
                name: "enquiry");

            migrationBuilder.DropTable(
                name: "fireplace_product");

            migrationBuilder.DropTable(
                name: "gallery_photo");

            migrationBuilder.DropTable(
                name: "internal_note");

            migrationBuilder.DropTable(
                name: "invoice_record");

            migrationBuilder.DropTable(
                name: "product_image");

            migrationBuilder.DropTable(
                name: "StaffTrustedDevices");

            migrationBuilder.DropTable(
                name: "custom_braai_option");

            migrationBuilder.DropTable(
                name: "client");

            migrationBuilder.DropTable(
                name: "staff_account");

            migrationBuilder.DropTable(
                name: "product");
        }
    }
}
