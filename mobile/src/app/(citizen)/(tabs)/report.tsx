import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    StatusBar,
    Image,
    ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Camera,
    MapPin,
    Image as ImageIcon,
    RefreshCw,
    SendHorizontal,
    ChevronDown,
} from 'lucide-react-native';
import { GlassCard } from '../../../shared/ui/GlassCard';
import { Button } from '../../../shared/ui/Button';
import { FormInput } from '../../../shared/ui/FormInput';
import { citizenService } from '../../../features/citizen/citizenService';

const WASTE_TYPES = [
    { id: 'ORGANIC', label: 'Hữu cơ', color: '#16a34a', emoji: '🌿' },
    { id: 'RECYCLABLE', label: 'Tái chế', color: '#2563eb', emoji: '♻️' },
    { id: 'HAZARDOUS', label: 'Nguy hại', color: '#dc2626', emoji: '⚠️' },
    { id: 'GENERAL', label: 'Rác thường', color: '#9333ea', emoji: '🗑️' },
];

export default function ReportScreen() {
    const queryClient = useQueryClient();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
    const [showAreas, setShowAreas] = useState(false);

    const { data: serviceAreas = [], isLoading: areaLoading } = useQuery({
        queryKey: ['active-service-areas'],
        queryFn: citizenService.getActiveServiceAreas,
    });

    const selectedArea = useMemo(
        () => serviceAreas.find((area) => area.areaId === selectedAreaId),
        [selectedAreaId, serviceAreas]
    );

    const submitMutation = useMutation({
        mutationFn: citizenService.createWasteReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-reports-home'] });
            queryClient.invalidateQueries({ queryKey: ['citizen-reports'] });
            Alert.alert(
                'Thành công',
                'Báo cáo rác đã được gửi. Doanh nghiệp/collector sẽ xử lý theo khu vực.',
                [{ text: 'OK', onPress: resetForm }]
            );
        },
        onError: (err: any) => {
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể gửi báo cáo. Vui lòng thử lại.');
        },
    });

    const resetForm = () => {
        setImageUri(null);
        setSelectedType(null);
        setDescription('');
        setLocation(null);
        setSelectedAreaId(null);
        setShowAreas(false);
    };

    const pickImage = async (source: 'camera' | 'library') => {
        let result;
        if (source === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Cần quyền camera', 'Vui lòng cấp quyền camera trong Cài đặt');
                return;
            }
            result = await ImagePicker.launchCameraAsync({ quality: 0.75 });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({ quality: 0.75 });
        }

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const getLocation = async () => {
        setLocationLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Cần quyền vị trí', 'Vui lòng cấp quyền vị trí trong Cài đặt');
                return;
            }
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const [geocode] = await Location.reverseGeocodeAsync(pos.coords);
            const address = [geocode?.street, geocode?.district, geocode?.city].filter(Boolean).join(', ');
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, address });
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!selectedAreaId) {
            Alert.alert('Thiếu khu vực', 'Vui lòng chọn khu vực xử lý.');
            return;
        }
        if (!selectedType) {
            Alert.alert('Thiếu loại rác', 'Vui lòng chọn loại rác.');
            return;
        }
        if (!location) {
            Alert.alert('Thiếu vị trí', 'Vui lòng xác định vị trí hiện tại.');
            return;
        }

        const noteText = `[${selectedType}] ${description || 'Báo cáo từ mobile app'}`;

        submitMutation.mutate({
            areaId: selectedAreaId,
            latitude: location.lat,
            longitude: location.lng,
            addressText: location.address,
            noteText,
            photoUrl: imageUri ?? undefined,
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#047857" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Báo cáo rác</Text>
                <Text style={styles.headerSub}>Chọn khu vực - vị trí - thông tin rác để gửi</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <GlassCard style={styles.imagePicker}>
                    {imageUri ? (
                        <View>
                            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
                            <View style={styles.imageActions}>
                                <TouchableOpacity style={styles.retakeBtn} onPress={() => pickImage('camera')}>
                                    <RefreshCw size={16} color="#059669" />
                                    <Text style={styles.retakeBtnText}>Chụp lại</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <ImageIcon size={48} color="#d1fae5" />
                            <Text style={styles.uploadTitle}>Thêm ảnh hiện trạng (khuyến nghị)</Text>
                            <View style={styles.uploadBtns}>
                                <Button
                                    title="Chụp ảnh"
                                    variant="primary"
                                    size="sm"
                                    icon={<Camera size={15} color="#fff" />}
                                    onPress={() => pickImage('camera')}
                                    style={{ flex: 1, marginRight: 8 }}
                                />
                                <Button
                                    title="Thư viện"
                                    variant="outline"
                                    size="sm"
                                    icon={<ImageIcon size={15} color="#059669" />}
                                    onPress={() => pickImage('library')}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>
                    )}
                </GlassCard>

                <Text style={styles.sectionLabel}>Khu vực *</Text>
                <TouchableOpacity
                    style={styles.areaPicker}
                    activeOpacity={0.8}
                    onPress={() => setShowAreas((prev) => !prev)}
                >
                    <Text style={styles.areaPickerText}>
                        {selectedArea?.name ?? (areaLoading ? 'Đang tải khu vực...' : 'Chọn khu vực xử lý')}
                    </Text>
                    <ChevronDown size={18} color="#64748b" />
                </TouchableOpacity>
                {showAreas && (
                    <GlassCard style={styles.areaListCard}>
                        {serviceAreas.map((area) => (
                            <TouchableOpacity
                                key={area.areaId}
                                style={[
                                    styles.areaRow,
                                    selectedAreaId === area.areaId && styles.areaRowActive,
                                ]}
                                onPress={() => {
                                    setSelectedAreaId(area.areaId);
                                    setShowAreas(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.areaRowText,
                                        selectedAreaId === area.areaId && styles.areaRowTextActive,
                                    ]}
                                >
                                    {area.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </GlassCard>
                )}

                <Text style={styles.sectionLabel}>Loại rác *</Text>
                <View style={styles.typeGrid}>
                    {WASTE_TYPES.map((wt) => (
                        <TouchableOpacity
                            key={wt.id}
                            style={[
                                styles.typeChip,
                                selectedType === wt.id && {
                                    borderColor: wt.color,
                                    backgroundColor: `${wt.color}18`,
                                },
                            ]}
                            onPress={() => setSelectedType(wt.id)}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.typeEmoji}>{wt.emoji}</Text>
                            <Text
                                style={[
                                    styles.typeLabel,
                                    selectedType === wt.id && { color: wt.color, fontWeight: '700' },
                                ]}
                            >
                                {wt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionLabel}>Vị trí *</Text>
                <GlassCard style={styles.locationCard}>
                    {location ? (
                        <View style={styles.locationRow}>
                            <MapPin size={16} color="#059669" />
                            <Text style={styles.locationText} numberOfLines={2}>
                                {location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                            </Text>
                        </View>
                    ) : (
                        <Button
                            title={locationLoading ? 'Đang xác định…' : 'Lấy vị trí hiện tại'}
                            variant="outline"
                            size="sm"
                            icon={<MapPin size={15} color="#059669" />}
                            loading={locationLoading}
                            onPress={getLocation}
                        />
                    )}
                </GlassCard>

                <FormInput
                    label="Mô tả thêm"
                    placeholder="VD: Bao tải rác ở vỉa hè, gần cột điện..."
                    multiline
                    numberOfLines={3}
                    value={description}
                    onChangeText={setDescription}
                    style={{ height: 90, textAlignVertical: 'top' }}
                />

                <Button
                    title="Gửi báo cáo"
                    size="lg"
                    loading={submitMutation.isPending}
                    icon={submitMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <SendHorizontal size={18} color="#fff" />}
                    onPress={handleSubmit}
                    style={styles.submitBtn}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    header: {
        backgroundColor: '#047857',
        paddingTop: Platform.OS === 'ios' ? 56 : 44,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    imagePicker: { padding: 0, overflow: 'hidden', marginBottom: 12 },
    preview: { width: '100%', height: 220, borderRadius: 20 },
    imageActions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 10 },
    retakeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#d1fae5',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    retakeBtnText: { color: '#059669', fontSize: 13, fontWeight: '600' },
    uploadPlaceholder: { alignItems: 'center', padding: 32, gap: 12 },
    uploadTitle: { fontSize: 16, fontWeight: '600', color: '#64748b', textAlign: 'center' },
    uploadBtns: { flexDirection: 'row', width: '100%' },
    sectionLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 4 },
    areaPicker: {
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    areaPickerText: { color: '#334155', fontSize: 14, fontWeight: '500' },
    areaListCard: { padding: 8, marginBottom: 12 },
    areaRow: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10 },
    areaRowActive: { backgroundColor: '#ecfdf5' },
    areaRowText: { color: '#334155', fontSize: 14 },
    areaRowTextActive: { color: '#059669', fontWeight: '700' },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 7,
        backgroundColor: '#fff',
        minWidth: '45%',
        flex: 1,
    },
    typeEmoji: { fontSize: 20 },
    typeLabel: { fontSize: 14, color: '#64748b' },
    locationCard: { padding: 14, marginBottom: 16 },
    locationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    locationText: { flex: 1, fontSize: 14, color: '#1e293b', lineHeight: 20 },
    submitBtn: { marginTop: 8 },
});

