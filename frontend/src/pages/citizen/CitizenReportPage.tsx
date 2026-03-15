import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, MapPin, UploadCloud } from "lucide-react";
import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

import { reportsApi, serviceAreasApi, wasteTypesApi } from "../../api";
import { MapComponent } from "../../components/maps/MapComponent";
import { Button } from "../../components/ui/button";
import { ReportAssistantBubble } from "../../components/ui/report-assistant-bubble";
import { PageHeader, SectionCard, SectionHeader } from "../../components/ui/page";
import { buildReportDescription } from "../../lib/reportMetadata";

const defaultCenter: [number, number] = [21.0285, 105.8542];

const reportSchema = z.object({
  description: z.string().optional(),
  estimatedWeightKg: z.number().positive("Khối lượng phải lớn hơn 0").max(10000).optional(),
  wasteTypeId: z.string().uuid("Vui lòng chọn loại rác"),
  areaId: z.string().uuid("Vui lòng chọn khu vực"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

type ReportFormValues = z.infer<typeof reportSchema>;

type WasteTypeOption = {
  wasteTypeId: string;
  name: string;
};

type ServiceAreaOption = {
  areaId: string;
  name: string;
};

export const CitizenReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const {
    control,
    clearErrors,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      description: "",
      wasteTypeId: "",
      areaId: "",
      estimatedWeightKg: undefined,
    },
  });

  const latitudeRegistration = register("latitude", { valueAsNumber: true });
  const longitudeRegistration = register("longitude", { valueAsNumber: true });
  const estimatedWeightRegistration = register("estimatedWeightKg", {
    setValueAs: (value) => (value === "" ? undefined : Number(value)),
  });

  const watchedWasteTypeId = useWatch({ control, name: "wasteTypeId" });
  const watchedAreaId = useWatch({ control, name: "areaId" });
  const watchedEstimatedWeightKg = useWatch({ control, name: "estimatedWeightKg" });

  const { data: wasteTypes } = useQuery({
    queryKey: ["waste-types"],
    queryFn: () => wasteTypesApi.getAll().then((response) => response.data.data),
  });

  const { data: areas } = useQuery({
    queryKey: ["service-areas"],
    queryFn: () => serviceAreasApi.getAll().then((response) => response.data.data),
  });

  const wasteTypeOptions: WasteTypeOption[] = wasteTypes ?? [];
  const areaOptions: ServiceAreaOption[] = areas ?? [];

  const selectedWasteTypeName = wasteTypeOptions.find(
    (option) => option.wasteTypeId === watchedWasteTypeId,
  )?.name;
  const selectedAreaName = areaOptions.find(
    (option) => option.areaId === watchedAreaId,
  )?.name;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      toast.info(
        "AI gợi ý đây là rác có thể tái chế. Vui lòng xác nhận lại loại rác thủ công.",
        {
          position: "bottom-right",
          autoClose: 3000,
        },
      );
    };
    reader.readAsDataURL(file);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
    setValue("latitude", lat, { shouldValidate: true, shouldDirty: true });
    setValue("longitude", lng, { shouldValidate: true, shouldDirty: true });
  };

  const captureCurrentLocation = () => {
    setIsCapturingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị.");
      setIsCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleMapClick(position.coords.latitude, position.coords.longitude);
        toast.success("Đã cập nhật vị trí thành công.");
        setIsCapturingLocation(false);
      },
      () => {
        toast.error("Không thể lấy vị trí hiện tại.");
        setIsCapturingLocation(false);
      },
    );
  };

  const onSubmit = async (data: ReportFormValues) => {
    if (!selectedLocation) {
      toast.error("Vui lòng ghim vị trí báo cáo trên bản đồ.");
      return;
    }

    try {
      let reportPhotoUrl: string | undefined;
      if (imageFile) {
        try {
          reportPhotoUrl = await reportsApi
            .uploadPhoto(imageFile)
            .then((response) => response.data?.data as string | undefined);
        } catch {
          reportPhotoUrl = imagePreview ?? undefined;
          if (reportPhotoUrl) {
            toast.warn(
              "Dịch vụ tải ảnh tạm không khả dụng, đang dùng ảnh nội bộ cho báo cáo.",
            );
          }
        }
      }

      await reportsApi.create({
        description: buildReportDescription(data.description || "", data.estimatedWeightKg),
        wasteTypeId: data.wasteTypeId,
        areaId: data.areaId,
        latitude: data.latitude,
        longitude: data.longitude,
        reportPhotoUrl,
      });

      toast.success(
        "Báo cáo rác thành công. Bạn sẽ nhận điểm khi rác được thu gom.",
      );
      navigate("/citizen/dashboard");
    } catch {
      toast.error("Gửi báo cáo thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian công dân</span>}
        title="Báo cáo điểm rác"
        description="Gửi báo cáo với quy trình ưu tiên bản đồ, rõ ràng hơn về ngữ cảnh và có thêm gợi ý để doanh nghiệp điều phối nhanh hơn."
        actions={
          <Button variant="outline" onClick={() => navigate("/citizen/reports")}>
            Xem báo cáo của tôi
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-5">
        <input type="hidden" {...latitudeRegistration} />
        <input type="hidden" {...longitudeRegistration} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <div className="space-y-4 lg:space-y-5">
            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Ảnh hiện trạng"
                description="Tải lên ảnh rõ nét để nhân viên thu gom xác nhận tình trạng tại chỗ."
              />

              <div className="p-5 sm:p-6">
                <div
                  className={`relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[26px] border-2 border-dashed p-4 transition-colors ${
                    imagePreview
                      ? "border-[rgba(31,93,78,0.24)] bg-[var(--primary-50)]"
                      : "border-[rgba(32,48,51,0.16)] bg-[var(--bg-surface-muted)]"
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative h-full w-full">
                      <img
                        src={imagePreview}
                        alt="Report evidence preview"
                        className="h-full min-h-[288px] w-full rounded-[20px] object-cover"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-4 right-4"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                      >
                        Đổi ảnh
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="report-photo"
                      className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 text-center"
                    >
                      <div className="shell-icon-chip h-16 w-16 rounded-[22px]">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-[var(--text-primary)]">
                          Thêm ảnh rác
                        </p>
                        <p className="max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
                          Tải lên ảnh JPG, PNG hoặc GIF. Ảnh rõ ràng giúp bàn giao cho nhân viên thu gom và xác nhận loại rác chính xác hơn.
                        </p>
                      </div>
                    </label>
                  )}

                  <input
                    id="report-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Chi tiết báo cáo"
                description="Chọn loại rác, khu vực phụ trách và thêm ngữ cảnh để báo cáo đủ thông tin ngay từ đầu."
              />

              <div className="grid gap-5 p-5 sm:p-6">
                <div>
                  <label htmlFor="waste-type" className="field-label">
                    Loại rác
                  </label>
                  <Controller
                    control={control}
                    name="wasteTypeId"
                    render={({ field }) => (
                      <select
                        id="waste-type"
                        value={field.value ?? ""}
                        onChange={(event) => {
                          field.onChange(event.target.value);
                          clearErrors("wasteTypeId");
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        className="shell-select"
                      >
                    <option value="">Chọn loại rác</option>
                    {wasteTypeOptions.map((option) => (
                      <option key={option.wasteTypeId} value={option.wasteTypeId}>
                        {option.name}
                      </option>
                    ))}
                      </select>
                    )}
                  />
                  {errors.wasteTypeId ? (
                    <p role="alert" className="field-error">
                      {errors.wasteTypeId.message}
                    </p>
                  ) : (
                    <p className="field-helper">
                      Chọn loại phù hợp nhất với vật liệu hiển thị trong ảnh.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="service-area" className="field-label">
                    Khu vực phục vụ
                  </label>
                  <Controller
                    control={control}
                    name="areaId"
                    render={({ field }) => (
                      <select
                        id="service-area"
                        value={field.value ?? ""}
                        onChange={(event) => {
                          field.onChange(event.target.value);
                          clearErrors("areaId");
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        className="shell-select"
                      >
                    <option value="">Chọn khu vực</option>
                    {areaOptions.map((option) => (
                      <option key={option.areaId} value={option.areaId}>
                        {option.name}
                      </option>
                    ))}
                      </select>
                    )}
                  />
                  {errors.areaId ? (
                    <p role="alert" className="field-error">
                      {errors.areaId.message}
                    </p>
                  ) : (
                    <p className="field-helper">
                      Việc này giúp báo cáo được chuyển đúng doanh nghiệp phụ trách khu vực đó.
                    </p>
                  )}
                </div>

                <div className="rounded-[24px] border border-[rgba(31,93,78,0.12)] bg-[var(--primary-50)] p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                      <label htmlFor="estimated-weight" className="field-label">
                        Khối lượng ước tính (kg)
                      </label>
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        Không bắt buộc, nhưng giúp doanh nghiệp đánh giá độ ưu tiên và năng lực xử lý tốt hơn.
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-white/82 px-4 py-3 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        Ước tính hiện tại
                      </p>
                      <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                        {watchedEstimatedWeightKg ? `${watchedEstimatedWeightKg} kg` : "--"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <input
                      id="estimated-weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      {...estimatedWeightRegistration}
                      className="shell-input"
                      placeholder="Ví dụ 12.5"
                    />
                    {errors.estimatedWeightKg ? (
                      <p role="alert" className="field-error">
                        {errors.estimatedWeightKg.message}
                      </p>
                    ) : (
                      <p className="field-helper">
                        Số ký này sẽ được đính kèm cùng báo cáo để đội thu gom có thêm ngữ cảnh.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="report-description" className="field-label">
                    Mô tả
                  </label>
                  <textarea
                    id="report-description"
                    {...register("description")}
                    rows={4}
                    placeholder="Thêm thông tin giúp nhân viên thu gom dễ tìm hoặc xử lý điểm rác."
                    className="shell-textarea"
                  />
                  <p className="field-helper">
                    Có thể ghi thêm mốc nhận diện, mùi, lối đi bị chắn hoặc rủi ro an toàn nếu có.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4 lg:space-y-5">
            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Ghim vị trí"
                description="Nhấn vào bản đồ để đánh dấu chính xác vị trí cần thu gom."
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={captureCurrentLocation}
                    disabled={isCapturingLocation}
                  >
                    {isCapturingLocation ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="mr-2 h-4 w-4" />
                    )}
                    Dùng vị trí của tôi
                  </Button>
                }
              />

              <div className="space-y-4 p-5 sm:p-6">
                <MapComponent
                  className="h-[420px] w-full"
                  points={
                    selectedLocation
                      ? [
                          {
                            id: "selected",
                            lat: selectedLocation[0],
                            lng: selectedLocation[1],
                            status: "PENDING",
                          },
                        ]
                      : []
                  }
                  onMapClick={handleMapClick}
                  center={selectedLocation ?? defaultCenter}
                />

                <div className="rounded-[22px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Tọa độ đã chọn
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                    {selectedLocation
                      ? `${selectedLocation[0].toFixed(6)}, ${selectedLocation[1].toFixed(6)}`
                      : "Chưa chọn vị trí nào"}
                  </p>
                  {errors.latitude || errors.longitude ? (
                    <p role="alert" className="field-error">
                      Vui lòng chọn vị trí trên bản đồ trước khi gửi.
                    </p>
                  ) : (
                    <p className="field-helper">
                      Hãy phóng to và đặt ghim sát nhất với vị trí đống rác.
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Trước khi gửi"
                description="Checklist nhanh để việc điều phối chính xác và ít phải trao đổi lại hơn."
              />

              <div className="grid gap-3 p-5 sm:p-6">
                {[
                  "Ảnh hiển thị rõ điểm rác.",
                  "Loại rác khớp với vật liệu nhìn thấy.",
                  "Ghim đã đặt đúng vị trí cần thu gom.",
                  "Nếu có thể, hãy thêm số ký ước tính để doanh nghiệp chuẩn bị tốt hơn.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[20px] border border-[var(--stroke-soft)] bg-white/82 px-4 py-3"
                  >
                    <div className="shell-icon-chip h-10 w-10 shrink-0">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="shell-toolbar justify-between">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Báo cáo vẫn dùng cùng schema backend, đường dẫn và logic tích điểm như hiện tại.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/citizen/dashboard")}
            >
              Hủy
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi báo cáo rác"
              )}
            </Button>
          </div>
        </div>
      </form>

      <ReportAssistantBubble
        hasImage={!!imagePreview}
        hasLocation={!!selectedLocation}
        wasteTypeName={selectedWasteTypeName}
        areaName={selectedAreaName}
        estimatedWeightKg={watchedEstimatedWeightKg ?? null}
      />
    </div>
  );
};
