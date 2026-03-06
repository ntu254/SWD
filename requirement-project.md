Topic "Crowdsourced Waste Collection & Recycling Platform. Nền tảng kết nối người dân, doanh nghiệp tái chế và dịch vụ thu gom rác theo khu vực. "

Context Quản lý rác thải đô thị tại Việt Nam đang đối mặt với nhiều thách thức như lịch thu gom không ổn định, tỷ lệ phân loại rác tại nguồn thấp và sự phối hợp rời rạc giữa người dân, đơn vị thu gom và doanh nghiệp tái chế. Trong khi đó, quy định bắt buộc phân loại rác tại nguồn từ năm 2025 đặt ra nhu cầu cấp thiết về một nền tảng số hỗ trợ kết nối, điều phối và giám sát toàn bộ quy trình thu gom – tái chế theo khu vực một cách hiệu quả và minh bạch.

Problems Hiện chưa có một hệ thống số hóa tập trung cho phép người dân báo cáo rác, theo dõi thu gom và khuyến khích phân loại đúng, đồng thời giúp doanh nghiệp tái chế và cơ quan quản lý tiếp cận dữ liệu vận hành theo thời gian thực. Việc thiếu công cụ điều phối và phân tích dữ liệu khiến hiệu quả thu gom thấp, chi phí tăng và làm giảm cơ hội phát triển kinh tế tuần hoàn.

Primary Actors "Citizen Recycling Enterprise Collector Administrator"

Functional Requirements "Citizen • Báo cáo rác/tái chế cần thu gom (ảnh + GPS + mô tả). • Theo dõi trạng thái thu gom của từng báo cáo (Pending / Accepted / Assigned / Collected). • Thực hiện phân loại rác tại nguồn (chọn loại rác khi tạo báo cáo). • Nhận điểm thưởng khi báo cáo hợp lệ và phân loại đúng. • Xem lịch sử điểm thưởng và bảng xếp hạng theo khu vực. • Gửi phản hồi hoặc khiếu nại khi việc thu gom không đúng cam kết. Recycling Enterprise • Đăng ký và quản lý năng lực xử lý rác: Loại rác tiếp nhận/Công suất xử lý/Khu vực phục vụ • Nhận và quyết định tiếp nhận hoặc từ chối các yêu cầu thu gom trong phạm vi hoạt động. • Xem danh sách yêu cầu thu gom được gợi ý ưu tiên xử lý dựa trên các tiêu chí cấu hình. (optional) • Gán và điều phối yêu cầu thu gom cho Collector thuộc doanh nghiệp. • Theo dõi tiến độ xử lý và trạng thái thu gom theo thời gian thực. • Xem báo cáo khối lượng rác đã thu gom và tái chế theo loại/khu vực/thời gian. • Tạo và cấu hình quy tắc tính điểm thưởng cho Citizen (theo loại rác, chất lượng báo cáo, thời gian xử lý…).

Quản lí các đơn khiếu nại liên quan tới collector Collector • Nhận các yêu cầu thu gom được phân công từ Recycling Enterprise.
• Cập nhật trạng thái thu gom theo thời gian thực (Assigned / On the way / Collected). • Xác nhận hoàn tất thu gom bằng hình ảnh và thông tin trạng thái. • Xem lịch sử công việc và số lượng yêu cầu đã hoàn thành.

Administrator • Quản lí tài khoản người dùng và phân quyền:(CRUD)(Tín, Tú) • Giám sát hoạt động tổng thể của hệ thống. (Hệ thống hiển thị dashboard tổng quan, bao gồm: Tổng số báo cáo thu gom theo trạng thái (Pending, Accepted, Assigned, Collected). Thống kê báo cáo theo khu vực và thời gian. Hiệu suất xử lý của các Recycling Enterprise. Hiệu suất làm việc của Collector. Thống kê điểm thưởng và khiếu nại.)

Quản lí các đơn kiểu nại liên quan tới hệ thống (ví dụ: cộng điểm sai, bug)
Quản lí thông báo
Quản lí doanh nghiệp
Quản lí phần thưởng đổi điểm
Setting(option: configapi,....)
Tùy chọn: AI hỗ trợ phân loại rác (Decision Support): Input: ảnh rác do Citizen upload Output: gợi ý loại rác (Organic / Recyclable / Hazardous…) Người dùng xác nhận lại trước khi gửi"
set nhận request theo điều kiện, và 1 collector sẽ lấy bao nhiêu báo cáo trong 1 ngày và ít nhất bao nhiêu kí đó,
Cho phép doanh nghiệp cấu hình số lượng báo cáo của collector trong 1 ngày và ít nhất bao nhiêu kí
Nếu collector hoàn thành đúng kpi trong khoảng thời gian thì sẽ được + bonus điểm thưởng để tăng rank
Nếu citizen hoàn thành đổi rác, và phân loại rác thì được cộng điểm, nếu thì chưa thì collector sẽ đánh giá dựa trên các tiêu chí để được cộng điểm
AI Web thì upload ảnh lên -> AI scan và gợi ý các loại rác, chatbot tư vấn hỗ trợ thông tin, detect thông tin chi tiết bức ảnh Mobile thì dùng máy ảnh chụp và ai scan đưa ra gợi ý