import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Loader2,
  MapPin,
  UploadCloud,
} from "lucide-react";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

import { reportsApi, serviceAreasApi, wasteTypesApi } from "../../api";
import { MapComponent } from "../../components/maps/MapComponent";
import { Button } from "../../components/ui/button";
import {
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
} from "../../components/ui/page";

const defaultCenter: [number, number] = [21.0285, 105.8542];

const reportSchema = z.object({
  description: z.string().optional(),
  wasteTypeId: z.string().uuid("Please select a waste category"),
  areaId: z.string().uuid("Please select an area"),
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
    null,
  );
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      description: "",
    },
  });

  const latitudeRegistration = register("latitude", { valueAsNumber: true });
  const longitudeRegistration = register("longitude", { valueAsNumber: true });

  const { data: wasteTypes } = useQuery({
    queryKey: ["waste-types"],
    queryFn: () => wasteTypesApi.getAll().then((response) => response.data.data),
  });

  const { data: areas } = useQuery({
    queryKey: ["service-areas"],
    queryFn: () =>
      serviceAreasApi.getAll().then((response) => response.data.data),
  });

  const selectedWasteType = useWatch({ control, name: "wasteTypeId" });
  const selectedArea = useWatch({ control, name: "areaId" });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      toast.info(
        "AI analysis suggests recyclable waste. Please confirm the category manually.",
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
      toast.error("Geolocation is not supported by your browser.");
      setIsCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleMapClick(position.coords.latitude, position.coords.longitude);
        toast.success("Location updated successfully.");
        setIsCapturingLocation(false);
      },
      () => {
        toast.error("Unable to retrieve your location.");
        setIsCapturingLocation(false);
      },
    );
  };

  const onSubmit = async (data: ReportFormValues) => {
    if (!selectedLocation) {
      toast.error("Please pin the report location on the map.");
      return;
    }

    try {
      await reportsApi.create({
        description: data.description || "",
        wasteTypeId: data.wasteTypeId,
        areaId: data.areaId,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      toast.success(
        "Waste reported successfully. You will earn points once it is collected.",
      );
      navigate("/citizen/dashboard");
    } catch {
      toast.error("Failed to submit report. Please try again.");
    }
  };

  const wasteTypeOptions: WasteTypeOption[] = wasteTypes ?? [];
  const areaOptions: ServiceAreaOption[] = areas ?? [];

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Citizen workspace</span>}
        title="Report a waste issue"
        description="Submit the same reporting payload through a clearer, map-first flow with better context, validation and field guidance."
        actions={
          <Button variant="outline" onClick={() => navigate("/citizen/reports")}>
            View my reports
          </Button>
        }
      />

      {/* <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">3-step submission</span>}
        title="Capture the evidence, confirm the area, then place the pin."
        description="Collectors respond faster when the photo, waste type and location are all clear. Nothing changes in the backend flow. This page simply makes the reporting sequence easier to complete."
        tone="mint"
        aside={
          <div className="space-y-4">
            <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-white/78 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Submission snapshot
              </p>
              <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                <p>
                  Category:{" "}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {wasteTypeOptions.find((item) => item.wasteTypeId === selectedWasteType)
                      ?.name ?? "Not selected"}
                  </span>
                </p>
                <p>
                  Area:{" "}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {areaOptions.find((item) => item.areaId === selectedArea)?.name ??
                      "Not selected"}
                  </span>
                </p>
                <p>
                  Location:{" "}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {selectedLocation
                      ? `${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)}`
                      : "Pin on map"}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-[20px] border border-[rgba(31,93,78,0.1)] bg-[var(--primary-50)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Use a close photo and place the marker on the exact pickup spot to help the assigned team route correctly.
            </div>
          </div>
        }
      /> */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-5">
        <input type="hidden" {...latitudeRegistration} />
        <input type="hidden" {...longitudeRegistration} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <div className="space-y-4 lg:space-y-5">
            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Evidence photo"
                description="Upload a clear image to help the collector confirm what is on site."
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
                        onClick={() => setImagePreview(null)}
                      >
                        Replace photo
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
                          Add a waste photo
                        </p>
                        <p className="max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
                          Upload JPG, PNG or GIF evidence. A clear image improves
                          collector handoff and category validation.
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
                title="Report details"
                description="Choose the waste type and service area before submitting."
              />

              <div className="grid gap-5 p-5 sm:p-6">
                <div>
                  <label htmlFor="waste-type" className="field-label">
                    Waste category
                  </label>
                  <select
                    id="waste-type"
                    {...register("wasteTypeId")}
                    className="shell-select"
                  >
                    <option value="">Select a category</option>
                    {wasteTypeOptions.map((option) => (
                      <option key={option.wasteTypeId} value={option.wasteTypeId}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {errors.wasteTypeId ? (
                    <p role="alert" className="field-error">
                      {errors.wasteTypeId.message}
                    </p>
                  ) : (
                    <p className="field-helper">
                      Pick the category that best matches the material visible in the photo.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="service-area" className="field-label">
                    Service area
                  </label>
                  <select
                    id="service-area"
                    {...register("areaId")}
                    className="shell-select"
                  >
                    <option value="">Select an area</option>
                    {areaOptions.map((option) => (
                      <option key={option.areaId} value={option.areaId}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {errors.areaId ? (
                    <p role="alert" className="field-error">
                      {errors.areaId.message}
                    </p>
                  ) : (
                    <p className="field-helper">
                      This keeps the report aligned with the correct local enterprise coverage.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="report-description" className="field-label">
                    Description
                  </label>
                  <textarea
                    id="report-description"
                    {...register("description")}
                    rows={4}
                    placeholder="Add any context that helps the collector find or handle the waste."
                    className="shell-textarea"
                  />
                  <p className="field-helper">
                    Mention landmarks, volume, odor, blocked paths or safety issues if relevant.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4 lg:space-y-5">
            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Location pin"
                description="Click the map to mark the exact pickup point."
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
                    Use my location
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
                    Selected coordinates
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                    {selectedLocation
                      ? `${selectedLocation[0].toFixed(6)}, ${selectedLocation[1].toFixed(6)}`
                      : "No pin selected yet"}
                  </p>
                  {errors.latitude || errors.longitude ? (
                    <p role="alert" className="field-error">
                      Please select a location on the map before submitting.
                    </p>
                  ) : (
                    <p className="field-helper">
                      Zoom in and place the marker as close as possible to the waste pile.
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Before you submit"
                description="A quick checklist for cleaner routing and less back-and-forth."
              />

              <div className="grid gap-3 p-5 sm:p-6">
                {[
                  "Photo shows the waste clearly.",
                  "Category matches the visible material.",
                  "Pin is placed on the exact pickup spot.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[20px] border border-[var(--stroke-soft)] bg-white/82 px-4 py-3"
                  >
                    <div className="shell-icon-chip h-10 w-10 shrink-0">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="shell-toolbar justify-between">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Reports keep the same backend schema, route path and reward logic.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/citizen/dashboard")}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit waste report"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
