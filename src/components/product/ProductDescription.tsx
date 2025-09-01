
import { Card, CardContent } from "@/components/ui/card";

interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription = ({ description }: ProductDescriptionProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Description</h3>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{description}</p>
      </CardContent>
    </Card>
  );
};
