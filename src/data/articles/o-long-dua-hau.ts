import type { Article } from '../types';
import { category, h2, h3, ol, p, product, ul } from './blocks';

/** Nguyên liệu và các bước lấy đúng từ ảnh công thức "Ôlong dưa hấu sả tắc" của Puni Tea. */
export const O_LONG_DUA_HAU: Article = {
  slug: 'cach-lam-o-long-dua-hau-sa-tac',
  title: 'Cách làm trà ô long dưa hấu sả tắc mát lạnh',
  description:
    'Công thức trà ô long dưa hấu sả tắc của Puni Tea: 100ml trà ô long, 40ml đường, 40ml dưa hấu, 1 cây sả, 1 trái tắc — lắc cùng đá là xong.',
  cover: '/images/articles/o-long-dua-hau-sa-tac.jpg',
  coverAlt: 'Ly trà ô long dưa hấu sả tắc màu đỏ hồng với đá viên và lá bạc hà',
  publishedAt: '2026-09-21',
  author: 'Puni Tea',
  relatedProductSlugs: ['tra-o-long-lai-barista', 'tra-lai-barista', 'tra-den-barista'],
  body: [
    p(
      'Ô long dưa hấu sả tắc là món trà trái cây có màu đỏ hồng bắt mắt, hợp với những ngày trời nóng. Công thức dưới đây do Puni Tea giới thiệu, chỉ cần năm nguyên liệu và một bình lắc. Nền trà của món này là trà ô long — bạn có thể dùng ',
      product('trà Ô Long Lài Barista', 'tra-o-long-lai-barista'),
      ' dạng trà rời đóng túi 500g.',
    ),
    h2('Nguyên liệu cho một ly'),
    p('Định lượng dưới đây dành cho một ly. Pha nhiều ly thì nhân đều các thành phần lên.'),
    ul(
      'Trà ô long: 100ml (cốt trà đã ủ và để nguội).',
      'Đường: 40ml (đường nước).',
      'Dưa hấu: 40ml (nước ép hoặc dưa hấu xay).',
      'Sả cây: 1 cây.',
      'Tắc: 1 trái.',
    ),
    p(
      'Ngoài ra bạn cần đá viên để lắc và phục vụ, cùng vài hạt lựu, lát tắc và lá húng lủi để trang trí như gợi ý của công thức.',
    ),
    h2('Chuẩn bị cốt trà ô long'),
    p(
      'Phần cốt trà quyết định hương vị của cả ly. Bạn ủ trà ô long với nước nóng, lọc bỏ bã rồi để nguội trước khi pha chế. Nên ủ cốt trà đậm hơn một chút so với khi uống nóng, vì lúc lắc với đá và nước dưa hấu, vị trà sẽ loãng bớt.',
    ),
    p(
      'Nếu pha thường xuyên, bạn có thể ủ sẵn một bình cốt trà, để nguội rồi giữ trong tủ lạnh và dùng trong ngày. Các dòng ',
      category('trà rời', 'tra-roi'),
      ' đóng túi lớn sẽ tiện cho việc ủ theo bình như vậy.',
    ),
    h2('Cách làm từng bước'),
    ol(
      'Cho cây sả vào bình lắc (shaker), nghiền nhẹ để sả ra tinh dầu.',
      'Lần lượt cho tất cả nguyên liệu vào bình: 100ml trà ô long, 40ml đường, 40ml dưa hấu và nước cốt 1 trái tắc.',
      'Thêm đá rồi lắc đều tay cho các nguyên liệu hòa quyện và lạnh hẳn.',
      'Đổ ra ly, trang trí thêm sả cây, dưa hấu, hạt lựu, lát tắc và lá húng lủi.',
    ),
    h3('Vì sao phải nghiền sả trước?'),
    p(
      'Hương sả nằm trong tinh dầu ở thân cây. Nghiền nhẹ làm thân sả dập, tinh dầu thoát ra và bám vào thành bình trước khi các nguyên liệu khác được đổ vào. Chỉ cần nghiền nhẹ tay — nghiền quá nát sẽ làm xơ sả lẫn vào nước, uống bị vướng.',
    ),
    h3('Không có bình lắc thì làm thế nào?'),
    p(
      'Bạn có thể dùng một hũ thủy tinh có nắp vặn kín thay cho bình lắc. Cho nguyên liệu và đá vào khoảng hai phần ba hũ, đậy chặt nắp rồi lắc. Điều quan trọng là lắc cùng đá để nước lạnh nhanh và có lớp bọt mỏng trên mặt.',
    ),
    h2('Mẹo để ly trà ngon hơn'),
    ul(
      'Chọn dưa hấu chín đỏ, ướp lạnh trước khi ép để nước dưa giữ màu và vị ngọt.',
      'Vắt tắc ngay trước khi pha, bỏ hạt để nước không bị đắng.',
      'Nếm lại trước khi rót ra ly: dưa hấu mỗi mùa ngọt khác nhau, bạn có thể bớt hoặc thêm chút đường.',
      'Dùng ly cao và nhiều đá để giữ lạnh lâu.',
    ),
    h2('Biến tấu với loại trà khác'),
    p(
      'Công thức gốc dùng trà ô long. Nếu muốn thử hương hoa, bạn có thể đổi sang ',
      product('trà Lài Barista', 'tra-lai-barista'),
      ' — trà xanh ướp hoa lài — và giữ nguyên các nguyên liệu còn lại. Khi đổi loại trà, hãy pha thử một ly nhỏ trước để chỉnh lượng đường cho vừa miệng.',
    ),
    p(
      'Bạn cũng có thể giảm đường nếu dưa hấu đã đủ ngọt, hoặc thêm vài lá húng lủi vào bình lắc để hương bạc hà rõ hơn. Những thay đổi này là tùy khẩu vị; định lượng chuẩn của công thức vẫn là 100ml trà, 40ml đường, 40ml dưa hấu, 1 cây sả và 1 trái tắc.',
    ),
    h2('Khi nào nên dùng món này?'),
    p(
      'Trà ô long dưa hấu sả tắc hợp nhất khi uống ngay sau khi pha, lúc đá chưa tan nhiều và hương sả còn rõ. Đây là món dễ làm khi nhà có khách hoặc cho buổi chiều cuối tuần: nguyên liệu quen thuộc, thao tác chỉ mất vài phút sau khi đã có cốt trà nguội.',
    ),
  ],
};
