CREATE TABLE "bo_luyen_tap" (
	"id" serial PRIMARY KEY NOT NULL,
	"tieu_de" varchar(255) NOT NULL,
	"nut_pham_vi_id" integer NOT NULL,
	"thoi_gian_phut" integer NOT NULL,
	"trang_thai" varchar(20) DEFAULT 'CONG_BO' NOT NULL,
	"da_khoa" boolean DEFAULT false NOT NULL,
	"nhan_ban_tu_id" integer,
	"nguoi_tao_id" integer NOT NULL,
	CONSTRAINT "ck_bo_thoi_gian" CHECK (thoi_gian_phut > 0),
	CONSTRAINT "ck_bo_trang_thai" CHECK (trang_thai IN ('NHAP', 'CONG_BO', 'AN'))
);
--> statement-breakpoint
CREATE TABLE "cau_da_lam" (
	"id" serial PRIMARY KEY NOT NULL,
	"luot_lam_id" integer NOT NULL,
	"thu_tu" smallint NOT NULL,
	"phien_ban_id" integer NOT NULL,
	"tra_loi" jsonb,
	"diem" numeric(4, 2),
	CONSTRAINT "uq_cau_da_lam" UNIQUE("luot_lam_id","thu_tu")
);
--> statement-breakpoint
CREATE TABLE "cau_hoi" (
	"id" serial PRIMARY KEY NOT NULL,
	"ma" varchar(20) NOT NULL,
	"nut_id" integer NOT NULL,
	"nut_cap" varchar(10) DEFAULT 'DANG' NOT NULL,
	"phien_ban_hien_tai_id" integer,
	"bi_an" boolean DEFAULT false NOT NULL,
	"nguoi_tao_id" integer NOT NULL,
	CONSTRAINT "cau_hoi_ma_unique" UNIQUE("ma"),
	CONSTRAINT "ck_cau_hoi_nut_cap" CHECK (nut_cap = 'DANG')
);
--> statement-breakpoint
CREATE TABLE "cau_trong_bo" (
	"id" serial PRIMARY KEY NOT NULL,
	"bo_id" integer NOT NULL,
	"phien_ban_id" integer NOT NULL,
	"thu_tu" smallint NOT NULL,
	CONSTRAINT "uq_cau_trong_bo" UNIQUE("bo_id","thu_tu")
);
--> statement-breakpoint
CREATE TABLE "lo_nhap_cau_hoi" (
	"id" serial PRIMARY KEY NOT NULL,
	"ten_file" varchar(255) NOT NULL,
	"nguoi_nhap_id" integer NOT NULL,
	"tong_so" integer NOT NULL,
	"so_thanh_cong" integer NOT NULL,
	"bao_cao_loi" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lua_chon" (
	"id" serial PRIMARY KEY NOT NULL,
	"phien_ban_id" integer NOT NULL,
	"ky_hieu" char(1) NOT NULL,
	"noi_dung" text NOT NULL,
	"la_dap_an_dung" boolean NOT NULL,
	CONSTRAINT "uq_lua_chon" UNIQUE("phien_ban_id","ky_hieu"),
	CONSTRAINT "ck_ky_hieu" CHECK (ky_hieu IN ('A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'))
);
--> statement-breakpoint
CREATE TABLE "luot_lam_bai" (
	"id" serial PRIMARY KEY NOT NULL,
	"hoc_sinh_id" integer NOT NULL,
	"bo_id" integer NOT NULL,
	"lan_thu" integer NOT NULL,
	"trang_thai" varchar(20) DEFAULT 'DANG_LAM' NOT NULL,
	"bat_dau_luc" timestamp with time zone NOT NULL,
	"han_nop" timestamp with time zone NOT NULL,
	"nop_luc" timestamp with time zone,
	"tong_diem" numeric(5, 2),
	"diem_thang_10" numeric(4, 2),
	"so_cau_dung_het" smallint,
	"ma_yeu_cau" uuid NOT NULL,
	CONSTRAINT "luot_lam_bai_ma_yeu_cau_unique" UNIQUE("ma_yeu_cau"),
	CONSTRAINT "uq_luot_lan_thu" UNIQUE("hoc_sinh_id","bo_id","lan_thu"),
	CONSTRAINT "ck_luot_trang_thai" CHECK (trang_thai IN ('DANG_LAM', 'DA_NOP', 'HET_GIO')),
	CONSTRAINT "ck_luot_diem" CHECK (diem_thang_10 IS NULL OR diem_thang_10 BETWEEN 0 AND 10)
);
--> statement-breakpoint
CREATE TABLE "nguoi_dung" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"mat_khau_bam" varchar(255) NOT NULL,
	"ho_ten" varchar(100) NOT NULL,
	"vai_tro" varchar(20) NOT NULL,
	"trang_thai" varchar(20) DEFAULT 'HOAT_DONG' NOT NULL,
	"ngay_tao" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nguoi_dung_email_unique" UNIQUE("email"),
	CONSTRAINT "ck_nguoi_dung_vai_tro" CHECK (vai_tro IN ('HOC_SINH', 'QUAN_TRI')),
	CONSTRAINT "ck_nguoi_dung_trang_thai" CHECK (trang_thai IN ('HOAT_DONG', 'BI_KHOA'))
);
--> statement-breakpoint
CREATE TABLE "nut_kien_thuc" (
	"id" serial PRIMARY KEY NOT NULL,
	"nut_cha_id" integer,
	"cap" varchar(10) NOT NULL,
	"ma" varchar(30) NOT NULL,
	"ten" varchar(255) NOT NULL,
	"thu_tu" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "nut_kien_thuc_ma_unique" UNIQUE("ma"),
	CONSTRAINT "uq_nut_id_cap" UNIQUE("id","cap"),
	CONSTRAINT "ck_nut_cap" CHECK (cap IN ('MON', 'LOP', 'CHUONG', 'BAI', 'DANG'))
);
--> statement-breakpoint
CREATE TABLE "phien_ban_cau_hoi" (
	"id" serial PRIMARY KEY NOT NULL,
	"cau_hoi_id" integer NOT NULL,
	"so_phien_ban" integer NOT NULL,
	"loai_cau" varchar(20) NOT NULL,
	"muc_do" varchar(20) NOT NULL,
	"de_bai" text NOT NULL,
	"loi_giai" text DEFAULT '' NOT NULL,
	"trang_thai" varchar(20) DEFAULT 'NHAP' NOT NULL,
	"nguon" varchar(20) DEFAULT 'THU_CONG' NOT NULL,
	"lo_nhap_id" integer,
	"nguoi_tao_id" integer NOT NULL,
	"nguoi_duyet_id" integer,
	"duyet_luc" timestamp with time zone,
	CONSTRAINT "uq_phien_ban" UNIQUE("cau_hoi_id","so_phien_ban"),
	CONSTRAINT "ck_pb_loai" CHECK (loai_cau IN ('TRAC_NGHIEM', 'DUNG_SAI')),
	CONSTRAINT "ck_pb_muc_do" CHECK (muc_do IN ('BIET', 'HIEU', 'VAN_DUNG')),
	CONSTRAINT "ck_pb_trang_thai" CHECK (trang_thai IN ('NHAP', 'DA_DUYET', 'DA_THAY_THE')),
	CONSTRAINT "ck_pb_nguon" CHECK (nguon IN ('THU_CONG', 'NHAP_FILE'))
);
--> statement-breakpoint
ALTER TABLE "bo_luyen_tap" ADD CONSTRAINT "bo_luyen_tap_nut_pham_vi_id_nut_kien_thuc_id_fk" FOREIGN KEY ("nut_pham_vi_id") REFERENCES "public"."nut_kien_thuc"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bo_luyen_tap" ADD CONSTRAINT "bo_luyen_tap_nhan_ban_tu_id_bo_luyen_tap_id_fk" FOREIGN KEY ("nhan_ban_tu_id") REFERENCES "public"."bo_luyen_tap"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bo_luyen_tap" ADD CONSTRAINT "bo_luyen_tap_nguoi_tao_id_nguoi_dung_id_fk" FOREIGN KEY ("nguoi_tao_id") REFERENCES "public"."nguoi_dung"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cau_da_lam" ADD CONSTRAINT "cau_da_lam_luot_lam_id_luot_lam_bai_id_fk" FOREIGN KEY ("luot_lam_id") REFERENCES "public"."luot_lam_bai"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cau_da_lam" ADD CONSTRAINT "cau_da_lam_phien_ban_id_phien_ban_cau_hoi_id_fk" FOREIGN KEY ("phien_ban_id") REFERENCES "public"."phien_ban_cau_hoi"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cau_hoi" ADD CONSTRAINT "cau_hoi_phien_ban_hien_tai_id_phien_ban_cau_hoi_id_fk" FOREIGN KEY ("phien_ban_hien_tai_id") REFERENCES "public"."phien_ban_cau_hoi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cau_hoi" ADD CONSTRAINT "cau_hoi_nguoi_tao_id_nguoi_dung_id_fk" FOREIGN KEY ("nguoi_tao_id") REFERENCES "public"."nguoi_dung"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cau_hoi" ADD CONSTRAINT "fk_cau_hoi_nut_dang" FOREIGN KEY ("nut_id","nut_cap") REFERENCES "public"."nut_kien_thuc"("id","cap") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cau_trong_bo" ADD CONSTRAINT "cau_trong_bo_bo_id_bo_luyen_tap_id_fk" FOREIGN KEY ("bo_id") REFERENCES "public"."bo_luyen_tap"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cau_trong_bo" ADD CONSTRAINT "cau_trong_bo_phien_ban_id_phien_ban_cau_hoi_id_fk" FOREIGN KEY ("phien_ban_id") REFERENCES "public"."phien_ban_cau_hoi"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lo_nhap_cau_hoi" ADD CONSTRAINT "lo_nhap_cau_hoi_nguoi_nhap_id_nguoi_dung_id_fk" FOREIGN KEY ("nguoi_nhap_id") REFERENCES "public"."nguoi_dung"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lua_chon" ADD CONSTRAINT "lua_chon_phien_ban_id_phien_ban_cau_hoi_id_fk" FOREIGN KEY ("phien_ban_id") REFERENCES "public"."phien_ban_cau_hoi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luot_lam_bai" ADD CONSTRAINT "luot_lam_bai_hoc_sinh_id_nguoi_dung_id_fk" FOREIGN KEY ("hoc_sinh_id") REFERENCES "public"."nguoi_dung"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luot_lam_bai" ADD CONSTRAINT "luot_lam_bai_bo_id_bo_luyen_tap_id_fk" FOREIGN KEY ("bo_id") REFERENCES "public"."bo_luyen_tap"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nut_kien_thuc" ADD CONSTRAINT "nut_kien_thuc_nut_cha_id_nut_kien_thuc_id_fk" FOREIGN KEY ("nut_cha_id") REFERENCES "public"."nut_kien_thuc"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phien_ban_cau_hoi" ADD CONSTRAINT "phien_ban_cau_hoi_cau_hoi_id_cau_hoi_id_fk" FOREIGN KEY ("cau_hoi_id") REFERENCES "public"."cau_hoi"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phien_ban_cau_hoi" ADD CONSTRAINT "phien_ban_cau_hoi_lo_nhap_id_lo_nhap_cau_hoi_id_fk" FOREIGN KEY ("lo_nhap_id") REFERENCES "public"."lo_nhap_cau_hoi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phien_ban_cau_hoi" ADD CONSTRAINT "phien_ban_cau_hoi_nguoi_tao_id_nguoi_dung_id_fk" FOREIGN KEY ("nguoi_tao_id") REFERENCES "public"."nguoi_dung"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phien_ban_cau_hoi" ADD CONSTRAINT "phien_ban_cau_hoi_nguoi_duyet_id_nguoi_dung_id_fk" FOREIGN KEY ("nguoi_duyet_id") REFERENCES "public"."nguoi_dung"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_luot_dang_lam" ON "luot_lam_bai" USING btree ("hoc_sinh_id","bo_id") WHERE trang_thai = 'DANG_LAM';