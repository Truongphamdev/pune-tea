import type { Article } from '../types';
import { category, h2, h3, ol, p, product, ul } from './blocks';

/** Số liệu ủ trà (2g · 100–150ml · 95–98°C · 3–10 phút) lấy đúng từ ảnh công thức của Puni Tea. */
export const NHAN_VANG: Article = {
  slug: 'cong-thuc-pha-tra-nhan-vang-chuan-vi',
  title: 'Công thức pha trà Nhãn Vàng chuẩn vị tại nhà',
  description:
    'Hướng dẫn ủ trà Nhãn Vàng Gold Label theo công thức của Puni Tea: 2g trà, 100–150ml nước 95–98°C, ủ 3–10 phút để có cốt trà đỏ nâu.',
  cover: '/images/products/tra-nhan-vang-gold-label.jpg',
  coverAlt: 'Hộp trà Nhãn Vàng Gold Label của Puni Tea đặt cạnh hai ly trà đá',
  publishedAt: '2026-09-28',
  author: 'Puni Tea',
  relatedProductSlugs: ['tra-nhan-vang-gold-label', 'tra-den-barista', 'tra-gung'],
  body: [
    p(
      'Một ly trà ngon bắt đầu từ cốt trà ủ đúng. Ủ quá ngắn thì nước nhạt, màu chưa lên; ủ quá lâu với nước quá sôi thì vị chát lấn hết hương. Bài viết này ghi lại công thức ủ ',
      product('trà Nhãn Vàng Gold Label', 'tra-nhan-vang-gold-label'),
      ' mà Puni Tea in ngay trên tài liệu giới thiệu sản phẩm, kèm vài lưu ý nhỏ để bạn làm theo được ngay ở nhà mà không cần dụng cụ pha chế chuyên dụng.',
    ),
    h2('Trà Nhãn Vàng Gold Label là gì?'),
    p(
      'Nhãn Vàng Gold Label là dòng trà túi lọc của Puni Tea, trên hộp ghi “Premium Tea Blend”. Mỗi hộp có khối lượng tịnh 200g, chia thành 100 túi lọc, mỗi túi 2g. Nhờ chia sẵn từng túi nên bạn không phải cân trà: một túi là một phần, pha bao nhiêu ly thì lấy bấy nhiêu túi.',
    ),
    p(
      'Sản phẩm thuộc nhóm ',
      category('trà túi lọc', 'tra-tui-loc'),
      ' — nhóm trà tiện nhất cho người mới bắt đầu, vì bã trà nằm gọn trong túi và không cần thêm dụng cụ lọc.',
    ),
    h2('Công thức ủ trà chuẩn vị'),
    p(
      'Công thức dưới đây là công thức Puni Tea công bố cho trà Nhãn Vàng. Bạn chỉ cần nhớ bốn con số: lượng trà, lượng nước, nhiệt độ nước và thời gian ủ.',
    ),
    ul(
      'Lượng trà: 1 tép trà (2g).',
      'Lượng nước: 100–150ml cho mỗi tép trà.',
      'Nhiệt độ nước pha: 95–98°C.',
      'Thời gian ủ: 3–10 phút.',
    ),
    p(
      'Kết thúc ủ, bạn lọc bỏ bã trà và thu được dịch cốt trà có màu đỏ nâu đẹp mắt. Đây là phần cốt để uống nóng, thêm đá hoặc dùng làm nền cho các món trà pha chế.',
    ),
    h2('Các bước thực hiện'),
    ol(
      'Đun nước sôi rồi để nghỉ chừng nửa phút cho nước về khoảng 95–98°C.',
      'Tráng ấm hoặc ly bằng một ít nước nóng để dụng cụ không làm nước nguội nhanh.',
      'Cho 1 tép trà vào ly, rót 100–150ml nước nóng lên trên.',
      'Đậy nắp và ủ từ 3 đến 10 phút tùy độ đậm bạn muốn.',
      'Nhấc túi trà ra, lọc bỏ bã và dùng ngay phần cốt trà.',
    ),
    h3('Chọn thời gian ủ trong khoảng 3–10 phút'),
    p(
      'Khoảng thời gian ủ khá rộng vì mỗi người thích một độ đậm khác nhau. Ủ gần mốc 3 phút cho ly trà nhẹ, hợp uống nóng không đường. Ủ gần mốc 10 phút cho cốt trà đậm hơn, phù hợp khi bạn định thêm đá hoặc pha cùng nguyên liệu khác, vì đá tan và sữa hay trái cây đều làm vị trà loãng đi.',
    ),
    h3('Pha nhiều ly cùng lúc'),
    p(
      'Muốn pha một bình cho cả nhà, bạn giữ nguyên tỉ lệ: mỗi tép trà 2g đi với 100–150ml nước. Ví dụ bình 1 lít dùng khoảng 7–10 tép trà. Đừng bớt trà rồi ủ lâu hơn để bù — cách đó thường cho nước chát mà vẫn thiếu hương.',
    ),
    h2('Gợi ý thưởng thức'),
    p(
      'Cốt trà Nhãn Vàng dùng được theo nhiều cách. Uống nóng là cách đơn giản nhất để cảm nhận trọn hương trà. Nếu thích uống lạnh, bạn để cốt trà nguội bớt rồi rót vào ly đầy đá; có thể thêm chút đường hoặc vài lát chanh tùy khẩu vị.',
    ),
    p(
      'Với người hay pha chế tại nhà, cốt trà đậm là nền cho trà trái cây và trà sữa. Nếu bạn cần lượng trà lớn hơn cho việc pha chế, có thể tham khảo ',
      product('trà Đen Barista', 'tra-den-barista'),
      ' dạng trà rời đóng túi 200g.',
    ),
    h2('Những lỗi thường gặp khi ủ trà'),
    ul(
      'Dùng nước chưa đủ nóng: trà không ra hết màu và hương, cốt trà nhạt.',
      'Ủ xong không lấy túi trà ra: trà tiếp tục ra chất và ngày càng chát.',
      'Bóp mạnh túi trà: nước đục hơn và vị gắt hơn.',
      'Pha quá ít trà cho nhiều nước rồi kéo dài thời gian ủ để bù.',
    ),
    h2('Bảo quản trà sau khi mở hộp'),
    p(
      'Trà dễ hút ẩm và bắt mùi. Sau khi mở hộp, bạn nên đóng kín nắp, để nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và tránh đặt cạnh gia vị có mùi mạnh. Cốt trà đã pha nên dùng trong ngày để giữ hương vị tốt nhất.',
    ),
    p(
      'Chỉ với bốn con số — 2g trà, 100–150ml nước, 95–98°C và 3–10 phút — bạn đã có một ly trà Nhãn Vàng đúng vị. Khi quen tay, hãy thử thay đổi thời gian ủ trong khoảng cho phép để tìm ra độ đậm hợp với mình nhất.',
    ),
  ],
};
